import express from 'express';
import ICAL from 'ical.js';
import fetch from 'node-fetch';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 1800 }); // 30 minutes cache

/**
 * Parse iCal date format to ISO string
 */
function parseIcalDate(dateString) {
  try {
    const time = ICAL.Time.fromString(dateString);
    return new Date(time.toJSDate()).toISOString();
  } catch (error) {
    console.error('Failed to parse date:', dateString, error);
    return null;
  }
}

/**
 * Parse event name to extract race name and session kind
 */
function parseName(fullName) {
  const regex = /FORMULA 1 (.+) - (.+)/;
  const match = fullName.match(regex);
  
  if (match) {
    return {
      name: match[1],
      kind: match[2]
    };
  }
  
  return null;
}

/**
 * Get property value from iCal event
 */
function getProperty(vevent, propertyName) {
  try {
    const prop = vevent.getFirstProperty(propertyName);
    if (!prop) return null;
    
    const value = prop.getFirstValue();
    
    // Handle ICAL.Time objects
    if (value && typeof value.toJSDate === 'function') {
      return value.toJSDate();
    }
    
    return value;
  } catch (error) {
    return null;
  }
}

/**
 * Find round in array by name
 */
function findRound(rounds, name) {
  return rounds.find(r => r.name === name);
}

/**
 * Create a new round object
 */
function newRound(vevent, name, kind) {
  const country = getProperty(vevent, 'location');
  const start = getProperty(vevent, 'dtstart');
  const end = getProperty(vevent, 'dtend');

  if (!country || !start || !end) {
    return null;
  }

  const startDate = new Date(start).toISOString();
  const endDate = new Date(end).toISOString();

  return {
    name: name,
    countryName: country,
    countryKey: null,
    start: startDate,
    end: endDate,
    sessions: [{
      kind: kind,
      start: startDate,
      end: endDate
    }],
    over: false
  };
}

/**
 * Update existing round with new session
 */
function updateRound(vevent, round, kind) {
  const start = getProperty(vevent, 'dtstart');
  const end = getProperty(vevent, 'dtend');

  if (!start || !end) {
    return;
  }

  const startDate = new Date(start).toISOString();
  const endDate = new Date(end).toISOString();

  round.sessions.push({
    kind: kind,
    start: startDate,
    end: endDate
  });

  if (new Date(startDate) < new Date(round.start)) {
    round.start = startDate;
  }

  if (new Date(endDate) > new Date(round.end)) {
    round.end = endDate;
  }
}

/**
 * Fetch and parse F1 schedule from iCal
 */
async function getSchedule(year) {
  const cacheKey = `schedule_${year}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    // F1 calendar URL
    const calUrl = 'https://ics.ecal.com/ecal-sub/660897ca63f9ca0008bcbea6/Formula%201.ics';
    const response = await fetch(calUrl);
    const icalData = await response.text();
    
    const jcalData = ICAL.parse(icalData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');
    
    const rounds = [];
    
    for (const vevent of vevents) {
      const summary = getProperty(vevent, 'summary');
      
      if (!summary) {
        continue;
      }
      
      const parsed = parseName(summary);
      if (!parsed) {
        continue;
      }
      
      const { name, kind } = parsed;
      
      const existingRound = findRound(rounds, name);
      
      if (existingRound) {
        updateRound(vevent, existingRound, kind);
      } else {
        const round = newRound(vevent, name, kind);
        
        if (!round) {
          console.warn('Failed to create round with name:', name);
          continue;
        }
        
        const roundStart = new Date(round.start);
        if (roundStart.getFullYear() !== year) {
          continue;
        }
        
        rounds.push(round);
      }
    }
    
    // Sort rounds by start date
    rounds.sort((a, b) => new Date(a.start) - new Date(b.start));
    
    const now = new Date();
    
    // Mark rounds as over and sort sessions
    for (const round of rounds) {
      round.over = new Date(round.end) < now;
      round.sessions.sort((a, b) => new Date(a.start) - new Date(b.start));
    }
    
    cache.set(cacheKey, rounds);
    return rounds;
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    throw error;
  }
}

/**
 * GET /api/schedule - Get full F1 schedule for current year
 */
router.get('/', async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const schedule = await getSchedule(year);
    res.json(schedule);
  } catch (error) {
    console.error('Failed to get schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/schedule/next - Get next upcoming race
 */
router.get('/next', async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const schedule = await getSchedule(year);
    const notOver = schedule.filter(r => !r.over);
    
    if (notOver.length === 0) {
      return res.status(204).send();
    }
    
    res.json(notOver[0]);
  } catch (error) {
    console.error('Failed to get next round:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as scheduleRouter };
