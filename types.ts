
export interface Participant {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf: string;
  unit: string;
  braceletStatus: 'Entregue' | 'Pendente';
  foodStatus: 'Recebido' | 'Pendente';
}

export interface DashboardStats {
  totalParticipants: number;
  goal: number;
  braceletsDelivered: number;
  braceletsPending: number;
  foodCollectedKg: number;
  recentDonationsKg: number;
}
