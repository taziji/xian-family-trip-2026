import test from 'node:test';
import assert from 'node:assert/strict';
import { days, ticketPlan, getDayById, ticketProgress } from '../app/itinerary.mjs';

test('the itinerary contains the full six-day trip in chronological order', () => {
  assert.equal(days.length, 6);
  assert.deepEqual(days.map((day) => day.date), ['10.23', '10.24', '10.25', '10.26', '10.27', '10.28']);
});

test('day selection returns the requested itinerary and falls back to arrival day', () => {
  assert.equal(getDayById('qin').title, '秦陵考古日');
  assert.equal(getDayById('missing').id, 'arrival');
});

test('ticket progress counts completed reservations', () => {
  const completed = new Set([ticketPlan[0].id, ticketPlan[2].id]);
  assert.deepEqual(ticketProgress(completed), { completed: 2, total: ticketPlan.length });
});
