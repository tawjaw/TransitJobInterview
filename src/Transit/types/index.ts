export type Transit = {
  id: string;
  city: string;
  subway?: TransitMode | undefined;
  bus?: TransitMode | undefined;
  rail?: TransitMode | undefined;
  feed: { id: string; url: string }[];
};

export type Route = {
  name: string;
  feedid: string;
};

export type TransitMode = {
  routes: Route[];
};

export type Stop = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: number;
  parent: string;
};

export type StopTimeUpdate = {
  arrival: StopTimeEvent;
  departure: StopTimeEvent;
  stopId: string;
};

export type StopTimeEvent = { time: Long };

export type FeedEntity = { id: string; tripUpdate: TripUpdate };

export type TripUpdate = {
  stopTimeUpdate: StopTimeUpdate[];
  trip: TripDescriptor;
};

export type TripDescriptor = {
  tripId: string;
  startTime: string;
  startDate: string;
  routeId: string;
};
