export type TransportDeparture = {
  id: string;
  line: string;
  destination: string;
  platform: string;
  minutesUntilDeparture: number;
  status: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  calendarId?: string;
  calendarName?: string;
  calendarColor?: string;
};
