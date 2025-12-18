export const F1_BASE_URL = 'livetiming.formula1.com/signalr';

export const SIGNALR_HUB = JSON.stringify([{ name: 'Streaming' }]);

export const SIGNALR_SUBSCRIBE = JSON.stringify({
  H: 'Streaming',
  M: 'Subscribe',
  A: [[
    'Heartbeat',
    'CarData.z',
    'Position.z',
    'ExtrapolatedClock',
    'TopThree',
    'RcmSeries',
    'TimingStats',
    'TimingAppData',
    'WeatherData',
    'TrackStatus',
    'SessionStatus',
    'DriverList',
    'RaceControlMessages',
    'SessionInfo',
    'SessionData',
    'LapCount',
    'TimingData',
    'TeamRadio',
    'PitLaneTimeCollection',
    'ChampionshipPrediction'
  ]],
  I: 1
});
