import NodeCache from "node-cache";

// Singleton cache instance
// stdTTL: default time-to-live in seconds (5 minutes = 300 seconds)
// checkperiod: interval for automatic deletion check (60 seconds)
const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  useClones: false,
});

export default cache;
