import { supabase, type Session, type Participant } from '../lib/supabase';
import { findParticipantByName } from './participants';

/**
 * Génère un code aléatoire à 6 chiffres
 * @returns Code à 6 chiffres sous forme de chaîne
 */
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Vérifie si un code de session est unique dans la base de données
 * @param code - Le code à vérifier
 * @returns true si le code est unique, false sinon
 */
export async function isCodeUnique(code: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('sessions')
    .select('code')
    .eq('code', code)
    .maybeSingle();

  if (error && (error as any).code === 'PGRST116') {
    return true;
  }

  return !data;
}

/**
 * Génère un code unique pour une session avec plusieurs tentatives
 * @returns Code unique à 6 chiffres
 * @throws Error si impossible de générer un code unique après 10 tentatives
 */
export async function generateUniqueCode(): Promise<string> {
  let code: string = generateCode();
  let attempts: number = 0;
  const maxAttempts: number = 10;

  while (!(await isCodeUnique(code)) && attempts < maxAttempts) {
    code = generateCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Impossible de générer un code unique');
  }

  return code;
}

/**
 * Recherche une session active par son code
 * @param code - Le code de la session
 * @returns La session trouvée ou null
 */
export async function findSessionByCode(code: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Erreur lors de la recherche de la session :', error);
    return null;
  }

  return data;
}

/**
 * Associe un participant à une session
 * @param sessionId - L'ID de la session
 * @param participantId - L'ID du participant
 * @returns Le participant mis à jour ou null en cas d'erreur
 */
export async function addParticipantToSession(sessionId: string, participantId: string): Promise<Participant | null> {
  const { data, error } = await supabase
    .from('participants')
    .update({ session_id: sessionId })
    .eq('id', participantId)
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de l\'ajout du participant à la session :', error);
    return null;
  }

  return data;
}

/**
 * Crée une nouvelle session de Planning Poker
 * @param sessionName - Le nom de la session
 * @param pseudo - Le pseudo du créateur
 * @param gameMode - Le mode de jeu
 * @param setCurrentSession - Setter pour la session courante
 * @param setCurrentParticipant - Setter pour le participant courant
 * @returns La session créée ou null en cas d'erreur
 */
export async function createSession(sessionName: string, pseudo: string, gameMode: string, setCurrentSession: (s: Session | null) => void, setCurrentParticipant: (p: Participant | null) => void): Promise<Session | null> {
  try {
    const participant: Participant | null = await findParticipantByName(pseudo.trim());
    if (!participant) {
      console.error('Participant introuvable.');
      return null;
    }
    if (participant.session_id) {
      console.error('Déjà connecté à une session.');
      return null;
    }
    const uniqueCode = await generateUniqueCode();
    const { data: session, error } = await supabase
      .from('sessions')
      .insert([{ name: sessionName, is_active: true, code: uniqueCode, gamemode: gameMode }])
      .select()
      .single();

    if (error || !session) {
      console.error('Erreur lors de la création de la session :', error);
      return null;
    }

    const createdSession: Session = session as Session;
    const connectedParticipant: Participant | null = await addParticipantToSession(createdSession.id, participant.id);
    if (!connectedParticipant) {
      console.error('Session créée mais échec de la connexion du participant.');
      return null;
    }

    setCurrentSession(createdSession);
    setCurrentParticipant(connectedParticipant);
    console.log(`Session créée: ${createdSession.name} (Code: ${createdSession.code})`);
    return createdSession;
  } catch (error) {
    console.error('Erreur lors de la création de la session :', error);
    return null;
  }
}

/**
 * Rejoint une session existante par son code
 * @param sessionCode - Le code de la session à rejoindre
 * @param pseudo - Le pseudo du participant
 * @param setCurrentSession - Setter pour la session courante
 * @param setCurrentParticipant - Setter pour le participant courant
 */
export async function joinSession(sessionCode: string, pseudo: string, setCurrentSession: (s: Session | null) => void, setCurrentParticipant: (p: Participant | null) => void): Promise<{ success: boolean; error?: string }> {
  const session = await findSessionByCode(sessionCode);
  if (!session) {
    console.error('Session introuvable ou inactive.');
    return { success: false, error: 'Session introuvable ou inactive.' };
  }

  const participant = await findParticipantByName(pseudo);
  if (!participant) {
    console.error('Participant introuvable.');
    return { success: false, error: 'Participant introuvable.' };
  }
  if (participant.session_id) {
    console.error('Déjà connecté à une session.');
    return { success: false, error: 'Déjà connecté à une session.' };
  }

  const updatedParticipant = await addParticipantToSession(session.id, participant.id);
  if (updatedParticipant) {
    setCurrentSession(session);
    setCurrentParticipant(updatedParticipant);
    console.log(`Rejoint la session: ${session.name} (Code: ${session.code})`);
    return { success: true };
  } else {
    console.error('Échec de la connexion à la session.');
    return { success: false, error: 'Échec de la connexion à la session.' };
  }
}

/**
 * Recherche une session active par son ID
 * @param sessionId - L'ID de la session
 * @returns La session active ou null
 */
export async function findActiveSession(sessionId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Erreur lors de la recherche de la session :', error);
    return null;
  }

  return data;
}

/**
 * Récupère la liste des participants d'une session
 * @param sessionId - L'ID de la session
 * @returns Liste des participants avec id et name, ou null en cas d'erreur
 */
export async function getSessionParticipants(sessionId: string): Promise<Array<{id: string, name: string}> | null> {
  const { data, error } = await supabase
    .from('participants')
    .select('id, name')
    .eq('session_id', sessionId);

  if (error) {
    console.error('Erreur lors de la récupération des participants :', error);
    return null;
  }

  return data;
}

/**
 * Désactive une session (is_active = false)
 * @param sessionId - L'ID de la session à désactiver
 * @returns La session mise à jour ou null en cas d'erreur
 */
export async function deactivateSession(sessionId: string): Promise<Session | null> {
  const { error } = await supabase
    .from('sessions')
    .update({ is_active: false })
    .eq('id', sessionId);

  if (error) {
    console.error('Erreur lors de la désactivation de la session :', error);
    return null;
  }

  const { data, error: selectError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (selectError) {
    console.error('Erreur lors de la récupération de la session mise à jour :', selectError);
    return null;
  }

  return data;
}

/**
 * Déconnecte tous les participants d'une session
 * @param sessionId - L'ID de la session
 * @returns true si la déconnexion a réussi, false sinon
 */
export async function disconnectParticipants(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('participants')
    .update({ session_id: null })
    .eq('session_id', sessionId);

  if (error) {
    console.error('Erreur lors de la déconnexion des participants :', error);
    return false;
  }

  return true;
}

/**
 * Termine complètement une session (désactive et déconnecte tous les participants)
 * @param sessionId - L'ID de la session à terminer
 * @param setCurrentSession - Setter pour la session courante
 */
export async function disableSession(sessionId: string, setCurrentSession: (s: Session | null) => void): Promise<void> {
  const activeSession = await findActiveSession(sessionId);
  if (!activeSession) {
    console.error('Session introuvable ou déjà désactivée.');
    setCurrentSession(null);
    return;
  }

  const participants = await getSessionParticipants(sessionId);
  if (!participants) {
    console.error('Impossible de récupérer les participants de la session.');
    return;
  }

  const session = await deactivateSession(sessionId);
  if (!session) {
    console.error('Erreur lors de la désactivation de la session.');
    return;
  }

  const disconnected = await disconnectParticipants(sessionId);
  if (!disconnected) console.error('Erreur lors de la déconnexion des participants.');

  setCurrentSession(null);

  const participantNames = participants.length > 0 ? participants.map(p => p.name).join(', ') : 'Aucun participant';
  console.log(`Session ${session.name} terminée. Participants: ${participantNames}`);
}
