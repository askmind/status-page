export type TransportDeparture = {
  id: string;
  line: string;
  destination: string;
  platform: string;
  minutesUntilDeparture: number;
  status: string;
};

export type WeatherForecast = {
  location: string;
  current: {
    temperatureC: number;
    condition: string;
    feelsLikeC: number;
    windKph: number;
    precipitationChance: number;
  };
  hourly: Array<{
    time: string;
    temperatureC: number;
    condition: string;
  }>;
};

export type CalendarEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
};
