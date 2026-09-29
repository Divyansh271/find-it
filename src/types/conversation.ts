export interface Conversation {
  convo_id: string;
  post_id: string;
  owner_id: string;
  finder_id: string;
  requested_by: string;
  request_text?: string | null;
  request_img?: string | null;
  accepted: boolean;
  created_at: string;

  // Joined/hydrated relations
  post?: {
    post_id: string;
    title: string;
    type: 'lost' | 'found';
    images?: string[];
    location_text?: string | null;
  };
  requester_profile?: {
    display_name: string;
    trust_score: number;
  };
  owner_profile?: {
    display_name: string;
    trust_score: number;
  };
  finder_profile?: {
    display_name: string;
    trust_score: number;
  };
}

export interface Message {
  id: number;
  convo_id: string;
  sender_id: string;
  msg_text?: string | null;
  msg_img?: string | null;
  created_at: string;
  sender_profile?: {
    display_name: string;
  };
}
