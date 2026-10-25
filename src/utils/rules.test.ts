import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePaymentOptimization } from './feeOptimizer';
import { analyzeConnectivity } from './dataConnectivity';

test('China fee optimization calculates standard card 3% surcharge on high spend', () => {
  const result = calculatePaymentOptimization('CN', 500000, 50000);
  assert.equal(result.destination, '중국 (충칭/청두 등)');
  assert.ok(result.maxSavingsKrw > 10000, 'Savings should be significant on 500k spend');
  assert.equal(result.recommendationDecision, 'USE_TRAVEL_CARD');
});

test('China fee optimization recommends KEEP_EXISTING on tiny budget', () => {
  const result = calculatePaymentOptimization('CN', 30000, 10000);
  assert.equal(result.recommendationDecision, 'KEEP_EXISTING');
  assert.ok(result.recommendationSummary.includes('커피 한 잔'));
});

test('Malaysia fee optimization identifies Grab 3% card fee vs GrabPay Wallet 0%', () => {
  const result = calculatePaymentOptimization('MY', 300000, 25000);
  assert.equal(result.destination, '말레이시아 (KL/페낭 등)');
  const grabDirect = result.comparison.find(c => c.methodId === 'grab_direct_card');
  const grabWallet = result.comparison.find(c => c.methodId === 'grab_wallet_travel');
  assert.ok(grabDirect && grabWallet);
  assert.equal(grabDirect.totalFeeKrw, 9000); // 3% of 300,000
  assert.equal(grabWallet.totalFeeKrw, 0);
  assert.equal(result.maxSavingsKrw, 9000);
});

test('Connectivity analysis calculates eSIM savings vs Roaming for 5 days', () => {
  const result = analyzeConnectivity('CN', 5, 1, true);
  assert.equal(result.tripDays, 5);
  // Roaming: 9900 * 5 = 49500, eSIM: 2500 * 5 = 12500 -> diff 37000
  assert.equal(result.totalSavingsVsRoaming, 37000);
  assert.ok(result.vpnAdviceForChina && result.vpnAdviceForChina.includes('방화벽'));
});
