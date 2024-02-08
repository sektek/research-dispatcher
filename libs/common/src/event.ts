type EventData = Record<string, unknown>;

export type Event = {
  id: string;
  type: string;
  data: EventData;
};
