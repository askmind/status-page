export type TransportDeparture = {
  id: string;
  line: string;
  destination: string;
  platform: string;
  minutesUntilDeparture: number;
  status: string;
};
