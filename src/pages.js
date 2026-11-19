// English content of the TapePool docs. The Chinese edition is src/pages.zh.js, keyed by the same ids.
// Each page: id (also the clean path /<id>), group (sidebar section), title, optional nav label, lead, body (HTML).
// House style: English; no em dash; facts from the TapePool repository (docs/SPEC.md is normative, then the
// redeploy-4 launch values); caps as shares of the pool; no return promises, no audit wording; every app
// screenshot is labelled "Sample data". Rebuild after editing: node build.mjs
import { helpers, X, TAPEOUT, APP, C } from './helpers.js';

export const edition = 'November 2026';
export const reviewed = 'November 19, 2026';

const { shot, art, table, addr } = helpers('en');

export default [
/* ───────────────────────── Start here ───────────────────────── */
{id:'overview',group:'Start here',title:'TapePool',nav:'Overview',lead:'A BEM lending pool on X Layer for TapeOut miners. Bridge your rig to X Layer and borrow against what it will mine.',body:`
<div class="badges"><span class="badge live">X Layer mainnet</span><span class="badge">BEM · tpBEM</span><span class="badge">7- and 14-day terms</span><span class="badge">Credit rule on a TapeOut circuit</span></div>
<p><strong>TapePool is a lending pool built in the TapeOut ecosystem and running on X Layer.</strong> Lenders deposit BEM. Miners who bridged a TapeOut rig to X Layer borrow BEM against the output that rig is expected to mine, and the rig repays the loan by itself while it mines. The app is at <a href="${APP}" target="_blank" rel="noreferrer">app.tapepool.io</a>.</p>
<ul>
<li><strong>Lenders</strong> deposit BEM and receive <strong>tpBEM</strong>, an ERC-4626 share. Its value grows as borrowers pay fees.</li>
<li><strong>Borrowers</strong> move a rig's RIG voucher into their own <strong>Rig Agent</strong> contract and take a BEM advance for 7 or 14 days.</li>
<li><strong>Repayment is automatic.</strong> While the agent holds the voucher, every harvest of the rig pays its BEM to the agent, and anyone can sweep that BEM into the pool: the fee first, then the principal. When the debt is cleared, the borrower takes the voucher back.</li>
<li><strong>The credit rule is a public TapeOut circuit.</strong> Whether an advance is allowed is decided by a NAND circuit taped out on X Layer and evaluated on chain. Anyone can read and verify the rule, and no one can change it quietly.</li>
<li><strong>A BEM price drop never triggers liquidation.</strong> The debt is in BEM and is repaid in BEM. There is no price oracle and no auction. A slow rig is never seized; only a rig proven impaired on chain (revoked, stopped, rescued or with no base power) can be, after a 72-hour window to repay. See <a href="#late-and-impaired">Late loans and impairment</a>.</li>
</ul>
${art('loan-flow', 'Diagram: a rig on BSC mines BEM; its RIG voucher sits in the Rig Agent on X Layer; the credit rule allows the advance; harvests pay BEM into the agent, which is swept into the pool; at debt zero the voucher goes back to the miner.', 'How a loan works: the rig mines on BSC, the loan lives on X Layer.')}
<h2>Start with the essentials</h2>
<div class="cards">
<a class="card" href="#how-it-works"><strong>How it works</strong><p>The roles, the two chains and the loop from voucher to repayment.</p><small>Read the overview</small></a>
<a class="card" href="#supply"><strong>Lend BEM</strong><p>Supply BEM, receive tpBEM, and withdraw idle BEM at any time.</p><small>For lenders</small></a>
<a class="card" href="#borrow"><strong>Borrow against a rig</strong><p>Every step of a first advance, from a ready rig to the borrow transaction.</p><small>For miners</small></a>
<a class="card" href="#terms"><strong>Terms and fees</strong><p>Debt caps, the flat fee, minimums and worked examples.</p><small>Know the numbers</small></a>
<a class="card" href="#risks"><strong>Risks</strong><p>What can go wrong for lenders and borrowers, and who can change what.</p><small>Read before you deposit</small></a>
<a class="card" href="#status"><strong>Status and roadmap</strong><p>What runs on mainnet today and what is still coming.</p><small>See where we are</small></a>
</div>
<h2>Who it is for</h2>
${table(['You are', 'What TapePool gives you', 'Start here'], [
  ['A TapeOut miner with a rig bridged to X Layer', 'BEM now, against what the rig will mine over 7 or 14 days. The rig keeps mining and repays the loan.', '<a href="#eligibility">Is my rig eligible?</a>'],
  ['A BEM holder on X Layer', 'A share of the fees miners pay, through tpBEM.', '<a href="#supply">Supply and withdraw</a>'],
  ['Anyone', 'A public credit rule you can verify, and permissionless repayment calls you can run yourself.', '<a href="#credit-rule">The credit rule</a>'],
])}
<div class="warn">TapePool is new software. Read <a href="#risks">Risks</a> before you supply or borrow, and check TapePool's contracts against <a href="#contracts">Contract addresses</a>. Nothing in these docs is financial advice.</div>`},

{id:'how-it-works',group:'Start here',title:'How TapePool works',nav:'How it works',lead:'Rigs mine on BSC, loans live on X Layer. A Rig Agent holds the voucher, a public circuit approves the advance and the rig\'s own harvests repay it.',body:`
<h2>The roles</h2>
${table(['Role', 'What they do'], [
  ['<strong>Lender</strong>', 'Deposits BEM into the pool and receives tpBEM. Withdraws idle BEM at any time.'],
  ['<strong>Miner (borrower)</strong>', 'Holds a TapeOut rig\'s RIG voucher on X Layer. Moves it into a Rig Agent, takes an advance, and takes the voucher back when the debt is cleared.'],
  ['<strong>Rig Agent</strong>', 'A small contract owned by one borrower. It holds the vouchers, borrows from the pool, receives the rig\'s harvests and passes them to the pool.'],
  ['<strong>Anyone</strong>', 'Can sweep harvested BEM into the pool, repay any loan, push rig reports, flag a rig proven impaired and seize after the windows. No call needs permission.'],
  ['<strong>Keeper</strong>', 'An off-chain bot run by the team that does the routine work on time: harvests, sweeps, report pushes and flags. It holds gas only, never pool funds. See <a href="#keeper">Keeper and guardian</a>.'],
])}
<h2>Two chains</h2>
<p>A TapeOut rig is a circuit mining on <strong>BSC</strong> through PodMining. When a miner bridges the rig to <strong>X Layer</strong>, they receive a <strong>RIG voucher</strong> (an ERC-721 token). Whoever holds the voucher when a harvest is sent on BSC receives that harvest's BEM on X Layer, less the 0.5% bridge fee.</p>
${table(['Chain', 'What lives there'], [
  ['BSC', 'The rig itself, PodMining, the rig vault (<code>harvest</code>), and the TapePool reporter that reads rig data.'],
  ['X Layer', 'RIG vouchers, the bridged BEM token, the TapePool pool (tpBEM), the Rig Agents, the credit-rule circuit, the screen registry and the receiver of rig reports.'],
])}
<h2>The loop</h2>
<ol class="steps">
<li><strong>Voucher in</strong>The miner creates a Rig Agent and moves the rig's voucher into it from their own wallet. Only the borrower can add collateral.</li>
<li><strong>Fresh rig data</strong>A report of the rig's state is sent from BSC to X Layer over LayerZero. The credit rule only accepts a report less than 5 minutes old.</li>
<li><strong>Check: allow</strong>The agent asks the credit rule. The circuit and a Solidity mirror both have to say yes: term, debt against expected output, fresh data, a healthy rig, an allowed processor, age and a screen pass.</li>
<li><strong>Advance in BEM</strong>The pool sends the advance to the borrower's wallet, never to the agent. The flat fee is added to the debt.</li>
<li><strong>Harvests repay</strong>Every harvest of the rig now pays BEM to the agent. A permissionless <code>sweep</code> moves it into the pool: late fee first (0 today), then the flat fee, then the principal.</li>
<li><strong>Voucher back</strong>At debt zero the loan closes, any BEM above the debt goes to the borrower, and the borrower releases the voucher (or borrows again).</li>
</ol>
<h2>The contracts</h2>
${table(['Component', 'Chain', 'Role'], [
  ['<code>TapePool</code>', 'X Layer', 'ERC-4626 vault: asset BEM, share tpBEM. Lends to agents, receives repayments, keeps a loss reserve. The single choke point for every BEM that leaves to a borrower.'],
  ['<code>AgentFactory</code> and <code>RigAgent</code>', 'X Layer', 'One small clone per agent; a borrower may own several. Holds up to 16 vouchers, carries one loan at a time.'],
  ['<code>CreditPolicy</code>', 'X Layer', 'Calls the policy circuit with a gas cap and strict decoding, and checks a Solidity mirror of the rule. Any unexpected result means deny.'],
  ['Policy circuit', 'X Layer', 'TapePool\'s own TapeOut processor and circuit (44 NAND gates). Output: allow.'],
  ['<code>RigScreen</code>', 'X Layer', 'Registry of screen passes: proof that a rig cannot be revoked by PodMining\'s official test vectors.'],
  ['Rig data feed', 'BSC to X Layer', 'A reporter on BSC reads each rig and sends the report over LayerZero to a receiver on X Layer. Both ends are locked after setup.'],
  ['<code>TapeLens</code>', 'X Layer', 'Read-only helper that quotes how much a rig can borrow and why a borrow would be refused.'],
  ['Keeper', 'off-chain', 'Harvests, sweeps, report pushes, flags. Its key can pull three emergency brakes; only the owner releases them.'],
])}
<p>The addresses of TapePool's contracts are on <a href="#contracts">Contract addresses</a>. Deeper pages: <a href="#credit-rule">credit rule</a>, <a href="#rig-feed">rig data feed</a>, <a href="#screen">revocation screen</a>, <a href="#pool-accounting">pool accounting</a>.</p>`},

{id:'status',group:'Start here',title:'Status and roadmap',lead:'What is live on X Layer mainnet today, what the app still lacks, and what is planned.',body:`
<p>TapePool was built for the OKX X Layer Build X "TapeOut Accelerate" hackathon. The contracts were redeployed several times as fixes landed; the current stack went live in November 2026. The app is open at <a href="${APP}" target="_blank" rel="noreferrer">app.tapepool.io</a>.</p>
<h2>Live</h2>
${table(['What', 'Since', 'Status'], [
  ['Policy circuit "Tape Pool Policy" (circuit ID 1) on X Layer', 'October 2026', '<span class="tag live">Live</span>'],
  ['First loan repaid by mined BEM (on an earlier deployment of the pool)', 'October 24, 2026', '<span class="tag live">Done</span>'],
  ['Rig data feed, BSC to X Layer, deployed and locked', 'November 16, 2026', '<span class="tag live">Live</span>'],
  ['Pool, Rig Agents, credit policy and screen registry (current stack)', 'November 16, 2026', '<span class="tag live">Live</span>'],
  ['Borrowing open on the current pool', 'November 18, 2026', '<span class="tag live">Live</span>'],
  ['Keeper: harvests, sweeps, report pushes, flags, upgrade watch', 'November 17, 2026 (current stack)', '<span class="tag live">Live</span>'],
])}
<h2>Launch terms</h2>
<ul>
<li>BEM fee: 0.25% for 7 days, 0.5% for 14 days, at least 0.001 BEM per loan. See <a href="#terms">Terms and fees</a>.</li>
<li>Operating fee: <strong>0 OKB</strong>. Until <strong>December 15, 2026</strong>, the keeper wallet covers the LayerZero fees of rig report pushes and scheduled harvests. A borrower's only network cost is X Layer gas.</li>
<li>Late fee: <strong>0</strong>. The owner committed in public to keep it at 0 until December 7, 2026; any later rate applies to new loans only.</li>
</ul>
<h2>Planned</h2>
${table(['What', 'Status'], [
  ['Telegram alerts for borrowers (flagged or repaid loans). The app shows the card with its button off.', '<span class="tag soon">Coming soon</span>'],
  ['A FAB pool for FabX rigs, which live on X Layer. Under evaluation; the app shows it as "Coming soon".', '<span class="tag plan">Evaluating</span>'],
  ['USD values in the app. Amounts are shown in BEM and OKB only.', '<span class="tag plan">Planned</span>'],
  ['WalletConnect and mobile wallets outside the OKX Wallet in-app browser.', '<span class="tag plan">Planned</span>'],
  ['A 30-day term. Deferred until there is more data; it needs a new circuit and a new pool deployment.', '<span class="tag plan">Deferred</span>'],
])}
<div class="note">Earlier deployments of the pool are retired: their supply cap is 0 and borrows are paused, but anyone who still holds shares in them can withdraw. The contracts in use today are on <a href="#contracts">Contract addresses</a>.</div>`},

/* ───────────────────────── Use the app ───────────────────────── */
{id:'app',group:'Use the app',title:'Using the app',nav:'App tour',lead:'A static page that reads the contracts through public RPCs and signs only through your own wallet.',body:`
<div class="badges"><a class="badge live" href="${APP}" target="_blank" rel="noreferrer">app.tapepool.io ↗</a><span class="badge">No server · no analytics</span><span class="badge">English · 中文</span></div>
<p>Open the app at <a href="${APP}" target="_blank" rel="noreferrer">app.tapepool.io</a>. It is a single static page. It reads X Layer and BSC through their public RPC endpoints, builds each transaction, and sends it to your wallet to sign. It has no server of its own, no key, no analytics and no third-party script. Optionally it talks to the keeper for share-value history and for rig report pushes.</p>
${shot('dashboard', 'TapePool app Dashboard: supplied BEM, growth since deposit, debt and next maturity, with tables for supplies, loans, assets to supply, borrowing against rigs, and transactions.', 'The Dashboard: your supplies, your loans and your recent transactions in one place.')}
<h2>Pages</h2>
${table(['Page', 'What you find there'], [
  ['<strong>Dashboard</strong>', 'Your tpBEM and what you can withdraw now, your open loans, what you can supply and how much you can borrow, and your transactions.'],
  ['<strong>Markets</strong>', 'Pool totals and the pools table. Opens the BEM pool page: supply, borrow terms, the credit rule and the contracts.'],
  ['<strong>Rigs</strong>', 'Every rig voucher you hold, its status and the action it allows: borrow, repay, release, take back, ask for a screen.'],
  ['<strong>Tape</strong>', 'A demo game with virtual BEM. See <a href="#tape">Tape demo</a>.'],
])}
${shot('markets', 'Markets page: total supply, total borrow and available liquidity, and a pools table with the BEM pool and a FAB row marked coming soon.', 'Markets. The FAB row is a placeholder for a future FabX pool.')}
<h2>Connect a wallet</h2>
<p>Click <strong>Connect wallet</strong>. The dialog lists every wallet your browser announces (EIP-6963), and recommends Binance Wallet, Trust Wallet, Rabby, MetaMask and OKX Wallet when they are not installed. The app asks your wallet to switch to <strong>X Layer</strong> (chain 196) and adds it if needed. BSC (chain 56) is used only when you send a transaction there yourself, such as a harvest.</p>
${shot('connect', 'Connect wallet dialog with installed wallets on the left and an explanation of what a wallet is on the right.', 'The connect dialog. Wallet names and icons come from your browser; the app never fetches anything from them.', 'medium')}
<ul>
<li>You need <strong>OKB</strong> on X Layer for gas.</li>
<li>WalletConnect is not supported yet. On a phone, use the OKX Wallet in-app browser.</li>
<li>Check every request in your wallet before you sign. The app never asks for a seed phrase or a private key.</li>
</ul>
<h2>The status bar</h2>
<p>The bar at the bottom of every page shows the pool's switches, read live from the contracts:</p>
${shot('statusbar', 'Status bar: Borrows open, Rig data feed on, No credit rule change queued, Deposits open.', 'Each dot turns amber or red when a brake is on.')}
${table(['Signal', 'What it means'], [
  ['Borrows open / paused', 'Whether new advances are allowed. A pause never blocks repayments, releases or withdrawals.'],
  ['Rig data feed on / off', 'Whether new rig reports are accepted for borrowing. Off means no new borrows; open loans keep repaying.'],
  ['Credit rule change queued', 'A new credit rule is waiting out its 7-day public queue. Borrows stay paused meanwhile.'],
  ['Deposits open / closed', 'Closed while the supply cap is reached or while a loan is flagged. Withdrawals stay open.'],
])}
<h2>Read-only view</h2>
<p>A wallet that cannot connect to a browser (a command-line or hardware-only setup) can still be followed: the app shows any address read-only at <code>app.tapepool.io/#/app/view/&lt;address&gt;</code>, with every write control off.</p>
${shot('view', 'Read-only view of an address showing its supplies, loans and rigs with all buttons disabled.', 'Read-only view of an address.')}
<h2>Language</h2>
<p>The <strong>EN · 中文</strong> switch in the header changes every label, message and number format. The choice is remembered on your device.</p>`},

{id:'tape',group:'Use the app',title:'Tape demo',lead:'A price game in the app that uses virtual BEM only. It never touches your wallet.',body:`
<div class="badges"><span class="badge">Demo</span><span class="badge">Virtual BEM only</span><span class="badge">No wallet, nothing signed</span></div>
<p><strong>Tape</strong> is a small game next to the lending pages. It starts you with a demo balance of virtual BEM and shows the live OKB / USD index from OKX's public market data. It has nothing to do with the pool: it never reads your balance, never asks your wallet for anything and keeps its session only in your browser's memory.</p>
${shot('tape', 'Tape demo: the OKB/USD index price line on the left and a grid of future price cells with multipliers on the right, with a demo balance and stake selector.', 'Tape: pick a stake, then click a future cell.')}
<h2>How a round works</h2>
<ol class="steps">
<li><strong>Pick a stake</strong>Choose an amount of virtual BEM.</li>
<li><strong>Click a future cell</strong>Each cell is a price band (5 cents tall) and a 5-second window, at least 10 seconds ahead. Its multiplier is shown on the cell.</li>
<li><strong>Watch the line</strong>If an observed price touches the band during its window, the ticket wins its multiplier on the stake. Otherwise the stake is lost.</li>
</ol>
<ul>
<li>Multipliers range from 1.01× to 8×. They follow recent price movement and pay 95% of a fair price for the chance of a touch, so on average a ticket returns less than its stake.</li>
<li>Prices come only from OKX's public index (once a second, no account, no cookie). If no fresh price arrives for 5 seconds, the game waits and refuses new tickets.</li>
<li>Reloading the page starts a new session. There is no real money in Tape and nothing can be withdrawn from it.</li>
</ul>`},

/* ───────────────────────── Lend BEM ───────────────────────── */
{id:'supply',group:'Lend BEM',title:'Supply and withdraw',lead:'Deposit BEM, receive tpBEM, and withdraw idle BEM whenever you want.',body:`
<p>The pool is an ERC-4626 vault. Its asset is the bridged <strong>BEM</strong> token on X Layer; its share is <strong>tpBEM</strong>. When you supply, you receive tpBEM at the current share value. When you withdraw, you return tpBEM and receive BEM at the share value of that moment.</p>
<h2>What you need</h2>
<ul><li>BEM on X Layer.</li><li>A little OKB on X Layer for gas.</li><li>A wallet connected to X Layer. See <a href="#app">Using the app</a>.</li></ul>
<h2>Supply BEM</h2>
<div class="pair">
<div><ol class="steps">
<li><strong>Open the BEM pool</strong><em>Markets</em> → <em>BEM</em> → <em>Supply</em>, or <em>Dashboard</em> → <em>Supply</em>.</li>
<li><strong>Enter an amount</strong>The panel shows the tpBEM you receive, the current tpBEM value and the room left under the supply cap.</li>
<li><strong>1 · Allow BEM</strong>An approval transaction, so the pool may pull exactly what you supply.</li>
<li><strong>2 · Supply BEM</strong>The deposit transaction. tpBEM arrives in your wallet.</li>
</ol></div>
${shot('supply', 'Supply BEM dialog: amount 2.0000 BEM, you receive about 1.9828 tpBEM, tpBEM value 1.0087 BEM, supply cap after and room left after, with buttons 1 Allow BEM and 2 Supply BEM.', 'Supply: approve once, then deposit.', 'narrow')}
</div>
<h2>Withdraw</h2>
<div class="pair">
<div><p>Open <em>Withdraw</em>, enter an amount of BEM (or <em>MAX</em>) and confirm one transaction. You can withdraw up to the pool's <strong>idle BEM</strong>: the BEM that is not lent out. The app shows it as <em>Withdrawable now</em>.</p>
<p>Caps, the borrow pause and the feed switch never block a withdrawal. If most of the pool is lent out, you may wait for repayments; loans repay from mining over 7 or 14 days.</p></div>
${shot('withdraw', 'Withdraw dialog showing the BEM amount, the tpBEM burned and the BEM withdrawable now.', 'Withdraw: limited only by idle BEM.', 'narrow')}
</div>
<h2>The BEM pool page</h2>
${shot('pool-supply', 'Supply card of the BEM pool page: total supplied against the supply cap, tpBEM value and idle BEM available to withdraw.', 'The pool\'s Supply card. "Caps only block new deposits, never withdrawals."', 'medium')}
<h2>When deposits close</h2>
<ul>
<li><strong>The supply cap is reached.</strong> The owner sets it; the app shows the room left.</li>
<li><strong>A loan is flagged.</strong> While any loan is marked doubtful, new deposits stop. Otherwise someone who expects the loan to be repaid could buy shares at the marked-down price and sell them after the repayment. Withdrawals keep working, at the lower price. See <a href="#share-value">Share value, fees and losses</a>.</li>
</ul>
<h2>How much stays idle</h2>
<p>New borrows can take at most <strong>70% of pool assets</strong>, so at least 30% stays idle when each loan is made. The share can drift after withdrawals, because caps check new borrows only. The pool also limits total lending to the current value of the owner's seed shares (the <em>backstop</em>), so other lenders' withdrawals are covered by idle BEM unless a loss lowers that seed. See <a href="#pool-accounting">Pool accounting and caps</a>.</p>`},

{id:'share-value',group:'Lend BEM',title:'Share value, fees and losses',nav:'Share value & losses',lead:'How fees reach tpBEM, why income is released over 7 days, and what happens when a loan goes bad.',body:`
<h2>Where the value comes from</h2>
<p>Borrowers pay a flat BEM fee on every advance. When a fee is paid:</p>
<ol>
<li><strong>20% goes to the loss reserve</strong>, until the reserve reaches 5% of pool assets (measured when the loan began).</li>
<li><strong>The rest is income for tpBEM holders.</strong> It reaches the share value gradually over <strong>7 days</strong>, never in the block it is paid.</li>
</ol>
<p>Fees are counted when they are paid, never when they are owed. BEM from seized vouchers and any other BEM sent to the pool is released the same way.</p>
<div class="note"><strong>Why 7 days?</strong> Releasing income over time means nobody can deposit just before a large repayment and leave right after it with a share of income they did not wait for.</div>
<h2>The share value</h2>
<pre><code>idle         = BEM held by the pool − loss reserve
total assets = idle + principal lent out − doubtful principal − income not yet released
tpBEM value  = total assets ÷ tpBEM supply</code></pre>
<p>tpBEM has 14 decimals (6 more than BEM), which protects the first deposits against share-price manipulation. A small "dead" seed of 0.01 BEM sent at launch to an address no one controls keeps the share supply above zero.</p>
<h2>When a loan goes bad</h2>
${table(['Event', 'Effect on lenders'], [
  ['A loan runs past maturity', 'Nothing changes. The rig keeps repaying. The late fee is 0 today, so a late loan earns lenders nothing extra.'],
  ['A loan is flagged (rig proven impaired)', 'Its remaining principal is marked <strong>doubtful</strong> and leaves the share value at once. Income not yet released absorbs the loss first. New deposits close.'],
  ['The borrower repays during the 72-hour cure window', 'The doubtful mark is removed and the value comes back. Deposits reopen.'],
  ['The loan is seized', 'The principal is written off. The loss reserve covers as much as it holds, and that cover returns to the share value at the seize. The seized vouchers keep mining for the pool.'],
])}
<p>The loss reserve never leaves the pool except to absorb a write-off.</p>
<div class="warn"><strong>No return is promised.</strong> Everything is counted in BEM: fees, losses and the share value. Nothing in TapePool protects you from a fall in the BEM price. A few miners hold most of the eligible rigs, so trouble at one large miner can reach a large part of the pool. See <a href="#risks">Risks</a>.</div>`},

/* ───────────────────────── Borrow against a rig ───────────────────────── */
{id:'eligibility',group:'Borrow against a rig',title:'Is my rig eligible?',nav:'Eligibility',lead:'The checks a rig must pass before it can back an advance, and every status the Rigs page can show.',body:`
<h2>The conditions</h2>
<div class="pair">
<div><ol>
<li><strong>Bridged to your wallet.</strong> The rig is bridged to X Layer and its RIG voucher is in your own wallet. Bridge on <a href="${TAPEOUT}" target="_blank" rel="noreferrer">tapeout.net</a> to your wallet, never directly to an agent.</li>
<li><strong>Supported processor:</strong> TapeOut, Behemoth or RefBench.</li>
<li><strong>At least 3 days old</strong>, counted from when the rig started mining.</li>
<li><strong>Screen pass in effect.</strong> The rig matches every official test vector of its task, and the pass was recorded on chain at least 48 hours ago. See <a href="#screen">Revocation screen</a>.</li>
<li><strong>Healthy:</strong> mining, not stopped, not revoked, not rescued, still in the rig vault, with base power above 0.</li>
<li><strong>Voucher in sync.</strong> The voucher on X Layer matches the rig on BSC. If it shows "not synced", harvest once on tapeout.net.</li>
</ol></div>
${shot('rig-rules', 'Card "When a rig can borrow" listing processor, age, official test vectors and screen pass, and base power conditions.', 'The same rules, as the Rigs page states them.', 'narrow')}
</div>
<p>At the moment of borrowing, the credit rule also needs a <strong>rig report less than 5 minutes old</strong>; the app asks the keeper to send one. Then the debt has to fit the term's cap (85% or 80% of expected base output), and the pool needs room: borrows open, the feed on, and enough idle BEM, borrow-cap room and per-borrower room.</p>
<div class="note"><strong>Only base power counts.</strong> A rig's design bonus is left out of every number, because it is usually lost within hours (a median of 0.44 days). Base power is the rig's verified weight without that bonus.</div>
<h2>Rig statuses</h2>
${shot('rigs-top', 'Rigs page: totals for debt, rigs in a loan, next keeper harvest and rigs ready to borrow, then rig cards with statuses such as Active, Seized, Moving to the pool, In your Rig Agent, Debt cleared and not collateral.', 'The Rigs page shows one card per voucher, with a status and the action it allows.')}
${table(['Status', 'Meaning', 'What you can do'], [
  ['<strong>Ready</strong>', 'Passes every check. Shows how much it can borrow for 7 days.', 'Borrow'],
  ['<strong>Active</strong>', 'In an open loan.', 'Repay, view the loan'],
  ['<strong>Debt cleared</strong>', 'The loan closed; the voucher is still in the agent.', 'Release the voucher, or borrow again'],
  ['<strong>In your Rig Agent</strong>', 'In an agent with no open loan.', 'Borrow again, take back'],
  ['<strong>Not collateral</strong>', 'Reached an agent without being registered (for example by a plain transfer). It counts nowhere.', 'Register it, or take it back'],
  ['<strong>Screen passed</strong>', 'A pass was recorded; it counts 48 hours later.', 'Wait for the time shown'],
  ['<strong>Not screened</strong>', 'No screen pass yet.', 'Ask for a screen'],
  ['<strong>Screen suspended / changed</strong>', 'The pass is suspended, or the rig changed and no longer matches it.', 'Ask for a new screen'],
  ['<strong>Too new</strong>', 'Mining for less than 3 days.', 'Wait for the date shown'],
  ['<strong>No base power</strong>', 'Base power is 0. Design bonuses do not count.', 'None'],
  ['<strong>Not mining</strong>', 'Stopped, revoked or not in custody on BSC.', 'None'],
  ['<strong>Processor not supported</strong>', 'Not TapeOut, Behemoth or RefBench.', 'None'],
  ['<strong>Voucher not synced / mismatch</strong>', 'The voucher on X Layer does not match the rig on BSC yet.', 'Harvest once on tapeout.net'],
  ['<strong>No data yet</strong>', 'No report about this rig has reached X Layer.', 'Wait, or refresh rig data'],
  ['<strong>Seized</strong>, <strong>Moving to the pool</strong>', 'Taken by the pool after an impairment; the voucher now mines for lenders.', 'None'],
])}
<h2>Ask for a screen</h2>
<div class="pair">
<div><p>A rig without a pass shows <strong>Ask for a screen</strong>. The screen only reads data: you send no transaction. The TapePool team runs it and, if the rig passes, records the pass on chain; it counts 48 hours later. Reach the team on <a href="${X}" target="_blank" rel="noreferrer">X, @Tape_Pool</a>.</p>
<p>A rig whose task cannot be proven gets no pass, so it cannot borrow.</p></div>
${shot('screen-note', 'Ask for a screen dialog explaining that the screen checks the rig against every official vector of its task and sends no transaction.', 'The "Ask for a screen" note.', 'narrow')}
</div>`},

{id:'borrow',group:'Borrow against a rig',title:'Take an advance, step by step',nav:'Borrow step by step',lead:'From a ready rig to BEM in your wallet: create an agent, move the voucher in, refresh rig data and borrow.',body:`
<h2>Before you start</h2>
<ul>
<li>The rig shows <strong>Ready</strong> on the Rigs page. See <a href="#eligibility">Is my rig eligible?</a></li>
<li>You hold its voucher in the wallet you connect, and some OKB on X Layer for gas.</li>
<li>You have read <a href="#terms">Terms and fees</a> and <a href="#late-and-impaired">Late loans and impairment</a>.</li>
</ul>
${shot('flow-fresh', 'Rig page for rig 4127: rig facts, term and amount selection, the borrow quote and the four steps with the Borrow button.', 'The rig page holds the whole flow: the rig, the term and amount, the quote and the steps.')}
<h2>The steps</h2>
<ol class="steps">
<li><strong>Pick the rig, the term and the amount</strong>Open <em>Rigs</em> and click <em>Borrow</em> on a ready rig. Choose 7 or 14 days, then an amount with the field, the slider or <em>MAX</em>. The maximum already accounts for the fee.</li>
<li><strong>Create a Rig Agent</strong>One transaction on X Layer. The app gives each rig its own agent, so a problem with one rig never reaches your other rigs. An empty agent you already own can be reused.</li>
<li><strong>Move the voucher into the agent</strong>One transaction per rig, sent from your wallet, which registers the voucher as collateral. Until you borrow you can take it back at any time (<em>Take back</em>).</li>
<li><strong>Refresh rig data</strong>The credit rule needs a report from BSC that is less than 5 minutes old. The keeper sends it for you: no transaction and no BNB. A countdown shows how long the report stays valid.</li>
<li><strong>Borrow</strong>One transaction. The agent checks the credit rule, and the pool sends the advance straight to your wallet.</li>
</ol>
<div class="pair">
${shot('quote', 'Borrow quote: you receive 0.6400 BEM, BEM fee flat 0.0016 BEM (0.25%), debt to repay 0.6416 BEM, operating fee 0 OKB (sponsored), minimum fee 0.001 BEM, late fee 0% per day, maturity, and debt against expected output 67.3% of max 85%.', '"Your borrow": every cost before you sign.', 'narrow')}
<div><h3>Read the quote</h3>
<ul>
<li><strong>You receive:</strong> the advance, sent to your wallet.</li>
<li><strong>BEM fee, flat:</strong> the whole cost of the advance. Repaying early does not reduce it.</li>
<li><strong>Debt to repay:</strong> advance plus fee.</li>
<li><strong>Operating fee:</strong> 0 OKB while the keeper sponsors cross-chain costs.</li>
<li><strong>Debt vs expected output:</strong> how close the debt is to the term's cap (85% or 80%).</li>
<li><strong>How it is repaid:</strong> when the keeper will harvest.</li>
</ul>
<p>Your transaction carries the fee and late-fee rate from the quote as limits. If a parameter changed in between, the borrow fails instead of costing more.</p></div>
</div>
<h2>BEM already mined</h2>
<p>A harvest pays whoever holds the voucher <em>when the harvest is sent on BSC</em>. So BEM your rig mined before the loan, if it is not harvested first, is paid to the agent once the voucher is there, and repays the loan. The app asks you to choose before you move the voucher:</p>
<div class="pair">
${shot('harvest-card', 'Steps card: 0.4080 BEM is mined and not harvested yet, with two choices: Harvest it to my wallet first (about 0.00165 BNB on BSC) or Keep it in this loan.', 'Harvest first, or let past rewards repay this loan.', 'narrow')}
<div><ul>
<li><strong>Harvest it to my wallet first:</strong> a harvest on BSC that you pay in BNB (the bridge message fee plus gas), or on tapeout.net. The BEM reaches your wallet on X Layer in about a minute, less the 0.5% bridge fee.</li>
<li><strong>Keep it in this loan:</strong> that BEM repays the loan first. The flat fee stays owed in full.</li>
</ul>
<p>Either way, any BEM above the debt comes back to you when the loan closes.</p></div>
</div>
${art('reward-paths', 'Illustration: two choices for already-mined BEM: harvest first to your wallet before the voucher transfer, or keep it in the loan after the transfer.', 'Two choices for past rewards. The OKB operating fee it mentions is 0 today.', 'medium')}
<h2>Several rigs in one loan</h2>
<p>An agent can hold up to 16 vouchers and borrow against all of them in one loan (<em>Borrow against several rigs in one loan</em>, an advanced option). Every rig in it must pass the checks. If one of them is impaired, the whole loan can be seized, with all its vouchers.</p>
<h2>If something blocks the borrow</h2>
${table(['Message', 'What to do'], [
  ['Borrows paused / feed off', 'A brake is on (see the status bar). Wait; repayments are not affected.'],
  ['No room in the pool for you', 'The pool is near its borrow cap, your per-borrower cap or its idle BEM. Try a smaller amount or later.'],
  ['Report expired', 'Refresh rig data again; the report is valid for 5 minutes.'],
  ['Credit rule: deny', 'The app says which input failed: amount above the cap, rig not eligible, data not fresh.'],
])}`},

{id:'terms',group:'Borrow against a rig',title:'Terms and fees',lead:'Two terms, a flat BEM fee, a debt cap measured against what the rig is expected to mine, and worked examples.',body:`
<h2>The term table</h2>
${table(['Term', 'Max debt (share of expected base output over the term)', 'Flat BEM fee', 'Maturity'], [
  ['7 days', '85%', '0.25%', 'start + 7 days'],
  ['14 days', '80%', '0.5%', 'start + 14 days'],
])}
<p class="source">Source: TapePool specification §4.1 and the launch values of November 16, 2026.</p>
${shot('pool-borrow', 'Borrow card of the BEM pool page: total borrowed against the borrow cap, term table with 7 days 0.25% fee and 85% debt cap, 14 days 0.5% and 80%, operating fee 0 OKB sponsored, minimum advance 0.01 and fee 0.001 BEM, late fee 0% per day, per-borrower cap 40% of pool assets.', 'The pool page states the live terms, read from the contract.', 'medium')}
<h2>Every number</h2>
${table(['Item', 'Value today', 'Notes'], [
  ['Minimum advance', '0.01 BEM', ''],
  ['Minimum fee', '0.001 BEM', 'Applies to 7-day advances below 0.4 BEM and 14-day advances below 0.2 BEM.'],
  ['Late fee', '0% per day', 'Kept at 0 until at least December 7, 2026. A later rate goes through the 48-hour queue and applies to new loans only.'],
  ['Operating fee', '0 OKB (sponsored)', 'If ever above 0, it is paid in OKB with the borrow and never refunded.'],
  ['Repaying early', 'Allowed any time', 'The flat fee stays the same.'],
  ['30-day term', 'Not offered', 'Deferred; it needs a new circuit and pool deployment.'],
])}
<p>The fee, the late-fee rate and the maturity are fixed when you borrow and stored in your loan. A later parameter change never affects an open loan.</p>
<h2>How the fee is computed</h2>
<pre><code>fee  = max( advance × rate, minimum fee )     rounded up to the last BEM unit
debt = advance + fee</code></pre>
${table(['Advance', 'Term', 'Fee', 'Debt', 'Effective fee'], [
  ['0.01 BEM', '7 days', '0.001 BEM', '0.011 BEM', '10%'],
  ['0.1 BEM', '7 days', '0.001 BEM', '0.101 BEM', '1%'],
  ['0.5 BEM', '7 days', '0.00125 BEM', '0.50125 BEM', '0.25%'],
  ['0.5 BEM', '14 days', '0.0025 BEM', '0.5025 BEM', '0.5%'],
  ['1 BEM', '14 days', '0.005 BEM', '1.005 BEM', '0.5%'],
], ['num', '', 'num', 'num', 'num'])}
<h2>How much a rig can borrow</h2>
<p>The cap applies to the whole debt (advance plus fee), so even a tiny loan cannot owe more than its rig is expected to mine. It is measured against <strong>expected base output</strong>:</p>
<pre><code>expected = base power × 7,128 BEM/day × term days × dilution × 0.995
           ÷ total verified weight of the network

dilution: 0.9907 for 7 days, 0.9815 for 14 days
max debt: 85% (7 days) or 80% (14 days) of expected</code></pre>
<ul>
<li><strong>7,128 BEM/day</strong> is the 7,200 BEM daily emission × 99% that goes to verified weight.</li>
<li><strong>Dilution</strong> assumes the network keeps growing about 0.27% a day, so the rig's share shrinks during the term.</li>
<li><strong>0.995</strong> removes the 0.5% bridge fee on harvested BEM.</li>
<li>The network weight comes from each live rig report, so the same rig can borrow a little less as the network grows. Every step rounds down, in the pool's favor.</li>
</ul>
<h3>Example</h3>
<p>Illustrative only, with a network verified weight of 1,650,000 H:</p>
${table(['Rig', 'Term', 'Expected output', 'Max debt', 'Max advance', 'Fee'], [
  ['20 H', '7 days', '0.5962 BEM', '0.5068 BEM', '0.5055 BEM', '0.0013 BEM'],
  ['20 H', '14 days', '1.1813 BEM', '0.9450 BEM', '0.9403 BEM', '0.0047 BEM'],
  ['1 H', '7 days', '0.0298 BEM', '0.0253 BEM', '0.0243 BEM', '0.001 BEM (minimum)'],
], ['', '', 'num', 'num', 'num', 'num'])}
<p>Even a 1 H rig fits a 7-day loan above the 0.01 BEM minimum. Pool limits can lower what you can take: see the caps below.</p>
<h2>Pool limits on a borrow</h2>
${table(['Limit', 'Rule'], [
  ['Borrow cap', 'Total principal lent out stays at or below 70% of pool assets, and below an absolute limit the owner sets.'],
  ['Per-borrower cap', 'One wallet\'s principal, across all its agents, stays at or below 40% of pool assets, and below an absolute limit.'],
  ['Idle BEM', 'An advance can only come from BEM that is not lent out.'],
  ['Backstop', 'Total principal stays at or below the current value of the owner\'s seed shares.'],
])}
<p>The app shows the binding limit and your room as <em>Available to borrow</em>.</p>
<h2>Other costs</h2>
<ul>
<li><strong>X Layer gas, in OKB:</strong> creating an agent, moving a voucher, borrowing, repaying and releasing. X Layer gas is small (a base fee around 0.02 gwei).</li>
<li><strong>BSC gas, in BNB:</strong> only if you harvest yourself or push a report yourself.</li>
<li>Until December 15, 2026, the keeper wallet pays the LayerZero fees for report pushes and scheduled harvests.</li>
</ul>
<p>No loan can run across the first BEM halving: a borrow is refused when its term would end within 30 days of it (August 2030).</p>`},

{id:'repay',group:'Borrow against a rig',title:'Repayment and release',lead:'Harvests repay the loan on their own. You can repay with BEM at any time, then take your voucher back.',body:`
${shot('loan-active', 'Loan page for rig 3871: debt now 0.3080 BEM, repayment progress, a timeline from start to maturity, where repayment comes from, and actions Repay with BEM, Release voucher and Apply harvested BEM now.', 'An active loan: what is repaid, what is mined but not harvested yet, and when the keeper harvests.')}
<h2>Automatic repayment</h2>
<ol class="steps">
<li><strong>The rig mines on BSC</strong>Mined BEM waits in the rig until a harvest. Mined but not harvested is not repaid yet.</li>
<li><strong>A harvest pays the agent</strong>While the agent holds the voucher, every harvest sends the rig's BEM to the agent on X Layer, less the 0.5% bridge fee.</li>
<li><strong>A sweep pays the pool</strong>Anyone can call <code>sweep</code> (the app's <em>Apply harvested BEM now</em>). It pays, in order: late fee (0 today), flat fee, principal. The keeper checks every 10 minutes.</li>
</ol>
<h3>When the keeper harvests</h3>
<ul>
<li><strong>As soon as the rig's output covers the debt</strong>, with a 1% margin and the bridge fee counted. The keeper checks every 10 minutes.</li>
<li>Otherwise <strong>in the last hour before maturity</strong>.</li>
<li>Then <strong>every 72 hours</strong> while a shortfall remains.</li>
</ul>
<p>You can harvest earlier yourself on <a href="${TAPEOUT}" target="_blank" rel="noreferrer">tapeout.net</a>, paying the BNB gas on BSC.</p>
<h2>Repay with BEM</h2>
<div class="pair">
<div><p>You can repay all or part of the debt with BEM at any time: <em>Repay with BEM</em>. The flat fee stays the same; there is no discount for repaying early.</p>
<p>Anyone can repay any loan. A repayment never pulls more than the debt left after the BEM already in the agent, so a third party's payment never turns into a surplus for the borrower.</p></div>
${shot('repay', 'Repay dialog with the debt now, the BEM already in the agent and an amount field.', 'Repay with BEM.', 'narrow')}
</div>
<h2>Take your voucher back</h2>
<p>When the debt reaches 0 the loan closes and any BEM above the debt goes to your wallet. The voucher stays in the agent as collateral until you choose:</p>
<div class="pair">
<div><ul>
<li><strong>Release voucher</strong> (one transaction) sends it back to your wallet.</li>
<li>Or leave it in the agent and <strong>borrow again</strong> without moving it.</li>
</ul>
<p>Only you can release your vouchers. If anyone could, a stranger could empty your agent between your deposit and your borrow and keep you from ever borrowing.</p></div>
${shot('release-card', 'Actions card with the Release voucher button: returns the voucher to your wallet; use Claim late BEM for harvests still on the way.', 'After the debt is cleared.', 'narrow')}
</div>
${art('repayment-release', 'Illustration: rig harvest, Rig Agent, debt 0, you take back the voucher, voucher home; BEM arriving after the loan is claimed with Claim late BEM.', 'Debt cleared: the loan closes, then you release the voucher.')}
<h2>BEM that arrives after the loan</h2>
<p>A harvest sent on BSC while the agent held the voucher still pays the agent, even if it lands after the loan closed or after you released the voucher. <strong>Claim late BEM</strong> sends that BEM to you. The Rigs page shows a banner when an empty agent holds some.</p>
<div class="note">Harvest before every hand-over. A harvest pays the holder at the time it was sent on BSC, not when it lands.</div>`},

{id:'late-and-impaired',group:'Borrow against a rig',title:'Late loans and impairment',nav:'Late loans & impairment',lead:'A slow rig is never seized. Only a rig proven impaired on chain can be, and only after 72 hours to repay.',body:`
${art('no-price-liquidations', 'Illustration: when the BEM price falls, the debt stays in BEM and mining repays it; when a rig is flagged as impaired, on-chain evidence is required, the borrower has 72 hours to repay, then seizure is possible.', 'Price moves never trigger liquidation. Impairment, proven on chain, can.')}
<h2>The BEM price never triggers liquidation</h2>
<p>The debt is counted in BEM and repaid in BEM. There is no price oracle and no auction, so a fall in the BEM price changes nothing about your loan.</p>
<h2>Late is not default</h2>
<p>A rig mines less when the network grows, so a loan can still owe something at maturity. That is <strong>not</strong> a default. The voucher stays in the agent and keeps repaying, and the keeper harvests every 72 hours until the debt is cleared. The late fee is 0 today; any future rate applies only to loans opened after it.</p>
<h2>What counts as impaired</h2>
<p>A rig in a loan is impaired when on-chain evidence shows at least one of these:</p>
<ul>
<li>it was <strong>revoked</strong> by PodMining (its status is no longer active);</li>
<li>it was <strong>stopped</strong>;</li>
<li>it was <strong>rescued</strong> by the TapeOut Safe, or is no longer in the rig vault's custody;</li>
<li>it has <strong>no base power</strong>.</li>
</ul>
<p>The evidence is either a fresh rig report that shows it, or the voucher record on X Layer showing power 0. Stale or missing data is never evidence. An upgrade of the voucher or vault contracts is not a seize trigger: the keeper pauses new borrows instead.</p>
<h2>The timeline after a flag</h2>
${table(['Phase', 'Length', 'What happens'], [
  ['Flag', 'one transaction', 'Anyone (usually the keeper) flags the loan with the evidence. Its remaining principal is marked doubtful for lenders, and new deposits close.'],
  ['Cure window', '72 hours', 'Repay the debt in full to keep your rigs. Repaying clears the flag.'],
  ['Seize window', '24 hours', 'Anyone can seize with evidence that the rig is still impaired.'],
  ['Seize', 'one transaction', 'The pool takes every collateral voucher in that agent, and the agent closes for good. The vouchers keep mining for lenders.'],
])}
${shot('loan-flagged', 'Flagged loan: rig 3871 is flagged because it stopped on BSC; repay the debt within the cure window to keep the rig, after which a 24-hour seize window opens.', 'A flagged loan shows the deadline and a Repay button.')}
<p>If nobody seizes during the seize window, the flag expires. The loan then stays marked doubtful until it is repaid, cleared with evidence that the rig is healthy again, or flagged again with new evidence. While the rig data feed is switched off, the expiry clock of a live flag pauses, and after the feed returns at least 24 hours of seize time remain.</p>
<h2>Keep rigs apart</h2>
<p>A seize takes every voucher that backs the loan. The app gives each rig its own agent, so one rig's problem does not reach your other rigs. Grouping rigs in one loan is possible, but then they are seized together.</p>`},

/* ───────────────────────── Mechanism ───────────────────────── */
{id:'credit-rule',group:'Mechanism',title:'The credit rule',lead:'Every advance must pass a public NAND circuit taped out on X Layer. It fails closed.',body:`
<p>The rule that decides whether an advance is allowed is a <strong>TapeOut circuit</strong>: TapePool's own processor, <strong>Tape Pool Policy</strong> (TPPOL), with circuit ID <strong>1</strong>, 44 NAND gates. It is evaluated on chain for every borrow. Anyone can read the netlist and check the rule, and the contracts pin its hash, so it cannot change quietly.</p>
${shot('pool-credit', 'Credit rule card: each loan must pass a public TapeOut circuit on X Layer; processor Tape Pool Policy (TPPOL), circuit ID 1, 44 NAND gates, netlist hash, 7-day queue to change it, and a Verify on the explorer button.', 'The pool page links the circuit on the explorer.', 'medium')}
<h2>The inputs</h2>
${table(['Bits', 'Input', 'Set to 1 when'], [
  ['0–1', 'Term code', '0 = 7 days, 1 = 14 days (2 and 3 always deny)'],
  ['2–6', 'Debt bucket', 'The debt as a share of expected base output, in 5% steps (below)'],
  ['7', 'Fresh', 'Every rig\'s report is under 5 minutes old and consistent'],
  ['8', 'Unimpaired', 'Every rig is active, not stopped, in custody, has base power, matches its voucher and sits in the agent'],
  ['9', 'Processor allowed', 'Every rig runs on TapeOut, Behemoth or RefBench'],
  ['10', 'Old enough', 'Every rig has mined for at least 3 days'],
  ['11', 'Screened', 'Every rig has a screen pass in effect'],
])}
<h2>The rule</h2>
<pre><code>allow = fresh AND unimpaired AND processor AND age AND screened
        AND ( (term = 7 days AND bucket ≤ 17) OR (term = 14 days AND bucket ≤ 16) )</code></pre>
<h3>The debt bucket</h3>
<pre><code>debt share = ceil( debt × 10,000 ÷ expected )      in basis points
bucket     = min( 31, ceil( debt share ÷ 500 ) )   5% steps</code></pre>
<p>85% and 80% fall exactly on bucket edges: bucket 17 means at most 85%, bucket 16 at most 80%. Both roundings go toward deny. For example, on a 1 H rig over 7 days, a debt of exactly 85% of expected output is allowed, and one raw BEM unit more is denied.</p>
<h2>Fail closed</h2>
<ul>
<li><code>CreditPolicy</code> calls the circuit's <code>eval</code> as a read-only call with a 1,000,000 gas cap, checks the circuit's size and netlist hash, and decodes the answer strictly.</li>
<li>It also computes the same rule in Solidity. The advance is allowed only if <strong>both</strong> say yes.</li>
<li>A revert, a missing report, an out-of-range value or any unexpected output means deny.</li>
</ul>
<h2>Changing the rule</h2>
<p>A new rule needs a new circuit and a new <code>CreditPolicy</code>. The owner queues it publicly for <strong>7 days</strong>, a full loan cycle, and new borrows stay paused while it waits. After that, anyone can activate it. The 30-day term is not encoded in the current circuit on purpose: its threshold is not decided, and a circuit that published an undecided rule would mislead.</p>`},

{id:'rig-feed',group:'Mechanism',title:'Rig data feed',lead:'Rigs mine on BSC and loans live on X Layer. A locked reporter carries each rig\'s state across over LayerZero.',body:`
<h2>What a report carries</h2>
<p>The <strong>reporter</strong> on BSC reads PodMining and the rig vault for each rig and sends a report to the <strong>receiver</strong> on X Layer, which keeps the newest report per rig:</p>
<ul>
<li>base power (verified weight without the design bonus) and the network's total verified weight;</li>
<li>status, stop block and whether the vault still holds the rig;</li>
<li>the rig's circuit and processor, and when it started mining;</li>
<li>when the reading was taken on BSC.</li>
</ul>
<p>One message carries up to 16 rigs. For borrowing, a report is valid for <strong>5 minutes</strong> (LayerZero usually delivers in well under a minute).</p>
<h2>Nobody can vouch for rig data</h2>
<ul>
<li>After setup, both ends were <strong>locked</strong>: owner and LayerZero delegate set to zero, libraries pinned. No key can change them.</li>
<li>Their verifier (DVN) settings mirror the BEM bridge's, so the feed trusts LayerZero only as far as the BEM repayments already must.</li>
<li>A custody read that fails or answers zero never becomes a report.</li>
</ul>
<p>The current feed was deployed and locked on November 16, 2026.</p>
<h2>Who sends reports</h2>
<ul>
<li><strong>The keeper</strong> pushes a report when you click <em>Refresh rig data</em>, rate-limited to 3 pushes per rig per UTC day and 10 per rolling 7 days. Until December 15, 2026 it pays the LayerZero fee.</li>
<li><strong>Anyone</strong> can push reports on BSC, paying the LayerZero fee in BNB. If the keeper does not answer, the app offers to do it from your wallet. A 16-rig push cost about 0.002 BNB in LayerZero fees in November 2026.</li>
</ul>
<h2>If the feed stops</h2>
<p>New borrows stop: they need a fresh report. Open loans keep repaying, because repayment depends on harvests and sweeps, not on reports. The guardian can switch the feed off as a brake; after the owner switches it back on, lending waits 6 more minutes so that a report from before the brake cannot be used.</p>`},

{id:'screen',group:'Mechanism',title:'Revocation screen',lead:'Revocation is the main way a loan can fail. Every rig must prove, before it borrows, that the official test vectors cannot revoke it.',body:`
<h2>Why a screen</h2>
<p>PodMining revokes a rig only through <code>challenge</code>, using one of the official test vectors frozen for the rig's task. A revoked rig stops earning, and a loan against it can default. So TapePool requires proof, in advance, that the rig matches <strong>every</strong> official vector.</p>
<h2>How a rig is screened</h2>
<ol>
<li>A read-only screen tool evaluates the rig's circuit against every official vector of its task.</li>
<li>It also simulates PodMining's own <code>challenge</code> with each vector; each must fail to revoke.</li>
<li>Where the circuit is small enough (input bits × cycles ≤ 20), it proves full equivalence with the task's reference circuit, and checks that no registered counterexample fails.</li>
<li>The result is published as an artifact bundle; its hash is recorded on chain with the pass, so anyone can re-run it.</li>
</ol>
<h2>On chain</h2>
${table(['Action', 'Who', 'Effect'], [
  ['Record a pass', 'owner', 'Takes effect <strong>48 hours</strong> later, so anyone can object first. Recording again restarts the 48 hours.'],
  ['Suspend a pass', 'guardian or owner', 'Instant. A suspended pass does not count.'],
  ['Lift a suspension', 'owner', 'Instant; restores a pass that was already public and past its delay.'],
  ['Revoke a pass', 'owner', 'Permanent. Adding it back is a new record with the full 48-hour delay.'],
])}
<p>The keeper pauses borrows if PodMining or the BSC circuit evaluator changes, and every pass is checked again before borrows reopen. Every rig bridged when the screen first ran passed it.</p>
<div class="warn"><strong>Disclosed trust.</strong> An on-chain pass is the owner's attestation of an off-chain proof, not a proof the chain checks. The 48-hour delay and the published artifacts let anyone object before a pass counts. A screen lowers the risk of revocation; it does not remove it.</div>`},

{id:'pool-accounting',group:'Mechanism',title:'Pool accounting and caps',nav:'Pool accounting & caps',lead:'How the vault counts its assets, the caps on new deposits and borrows, and the backstop rule.',body:`
<h2>Assets</h2>
<pre><code>idle         = tracked BEM − loss reserve
total assets = idle + principal lent out − doubtful principal − income not yet released</code></pre>
<ul>
<li><strong>Tracked BEM</strong> is what the pool has booked. BEM sent to the pool directly is booked at the next pool call and released over 7 days like any income.</li>
<li><strong>Lending moves idle to principal lent out</strong>, so a borrow does not change total assets.</li>
<li><strong>Withdrawals use idle BEM only.</strong> <code>maxWithdraw</code> and <code>maxRedeem</code> are capped to it, and every rounding favors the vault.</li>
</ul>
<h2>Caps</h2>
<p>Caps only block <strong>new</strong> deposits and <strong>new</strong> borrows. They never block a repayment, a sweep or a withdrawal.</p>
${table(['Cap', 'Rule', 'Who sets it'], [
  ['Supply cap', 'Total assets after a deposit stay at or below the cap. <code>maxDeposit</code> reports the room left, and 0 while a loan is doubtful.', 'Owner, within a hard bound in code'],
  ['Borrow cap', 'Principal lent out ≤ 70% of total assets, and ≤ an absolute limit.', 'Owner, within hard bounds'],
  ['Per-borrower cap', 'One wallet\'s principal, summed across its agents, ≤ 40% of total assets, and ≤ an absolute limit.', 'Owner, within hard bounds'],
  ['Liquidity', 'An advance ≤ idle BEM.', 'Fixed'],
  ['Backstop', 'Principal lent out ≤ the current value of the backstop\'s shares.', 'Fixed at deploy'],
  ['Per rig', 'Debt ≤ 85% (7 days) or 80% (14 days) of expected base output.', 'The credit rule'],
])}
<p>These are admission checks, not standing ratios: lowering a cap below what is already lent leaves those loans alone, and percentages can drift after withdrawals.</p>
<h2>The backstop</h2>
<p>The <strong>backstop</strong> is the address that holds the owner's seed shares, fixed when the pool was deployed. Total lending can never exceed the current value of those shares, so while the seed stays in, other lenders' withdrawals are covered by idle BEM. A loss lowers the seed's value first in that comparison and can make withdrawals wait for repayments or a top-up.</p>
<h2>Fee split and reserve</h2>
<ul>
<li>20% of each fee (flat and late) goes to the loss reserve, up to 5% of the total assets measured when the loan began. These shares are stored per loan, so later changes apply to later loans only.</li>
<li>The rest is booked as income and released over 7 days.</li>
<li>At a seize, the reserve covers the written-off principal as far as it can.</li>
</ul>
<h2>Seized vouchers</h2>
<p>A seized voucher goes to the pool and stays there: the pool has no function that transfers vouchers out. Its harvests pay the pool directly, and the keeper keeps harvesting them weekly.</p>`},

{id:'keeper',group:'Mechanism',title:'Keeper and guardian',lead:'An off-chain bot does the routine work on time. Its key can pull three brakes and nothing else.',body:`
<h2>What the keeper does</h2>
${table(['Job', 'Chain', 'When'], [
  ['Harvest rigs in a loan', 'BSC', 'Once their output covers the debt (checked every 10 minutes), otherwise in the last hour before maturity, then every 72 hours while a shortfall remains'],
  ['Harvest seized vouchers', 'BSC', 'Weekly'],
  ['Sweep agents into the pool', 'X Layer', 'Every 10 minutes when BEM is waiting'],
  ['Push rig reports', 'BSC to X Layer', 'When a borrower asks, rate-limited'],
  ['Flag impaired loans', 'X Layer', 'When evidence permits'],
  ['Watch TapeOut contracts', 'both', 'Compares implementation slots with reviewed values, using finalized reads'],
  ['Alert the owner', 'off-chain', 'Through a Telegram bot'],
])}
<p>It runs on a hosted service and holds only gas (BNB and OKB), never pool funds. It also serves the app read-only data: share-value history and positions.</p>
<h2>The guardian brakes</h2>
<p>The keeper's key is also the <strong>guardian</strong>. It can do three things, each instantly, and only the owner can undo them:</p>
<ul>
<li><strong>Pause borrows.</strong></li>
<li><strong>Suspend a rig's screen pass.</strong></li>
<li><strong>Switch off the rig data feed.</strong></li>
</ul>
${table(['The keeper detects', 'It does at once', 'The owner then'], [
  ['A change of the voucher, rig vault or PodMining implementation', 'Pauses borrows and switches off the feed', 'Reviews the change and restores when the data is trusted again'],
  ['A change of the BSC circuit evaluator', 'Pauses borrows', 'Reviews the evaluator and the screen assumptions'],
  ['A rescue of one rig', 'Suspends that rig\'s pass, pushes a report and flags any loan that holds it', 'Revokes the pass, or lifts the suspension after a false alarm'],
])}
<p>Open loans continue in every case. No brake ever touches repayments, withdrawals, flags or seizes.</p>
<h2>If the keeper stops</h2>
<p>Nothing it does needs its key except the brakes. Anyone can harvest a rig (on tapeout.net), push reports, sweep agents, repay, flag with evidence and seize after the windows. If the guardian key leaked, the worst case is paused borrows, suspended passes or a switched-off feed, and the owner undoes each in one transaction and rotates the key.</p>`},

/* ───────────────────────── Trust and safety ───────────────────────── */
{id:'admin',group:'Trust and safety',title:'Who can change what',lead:'Tightening is instant, loosening waits 48 hours in a public queue, a new credit rule waits 7 days. No one can move pool funds or vouchers.',body:`
<h2>Roles</h2>
${table(['Role', 'Can', 'Cannot'], [
  ['<strong>Owner</strong> (a dedicated, hand-signed browser wallet)', 'Every lever below, within hard bounds and delays. Release the brakes.', 'Move pool BEM, reserve BEM or vouchers; change an open loan; change the asset; mint shares; upgrade a contract; renounce ownership'],
  ['<strong>Guardian</strong> (the keeper\'s key)', 'Pause borrows, suspend a pass, switch off the feed', 'Undo any brake, veto owner changes, stop deposits or seizes, move anything'],
  ['<strong>Anyone</strong>', 'Sweep, repay, claim late BEM, flag and seize with evidence, push reports, execute a queued change after its delay', 'Add collateral to someone else\'s agent, send funds anywhere except the defined paths'],
])}
<div class="ok"><strong>There is no function that moves pool BEM, reserve BEM or vouchers at the owner's or the guardian's request.</strong> The contracts are not upgradeable.</div>
<h2>Delays</h2>
${table(['Change', 'Delay'], [
  ['Lower a cap, pause borrows, switch off the feed, suspend or revoke a pass', 'Instant'],
  ['Raise a cap, change a fee, the minimums, the late fee, the reserve terms or the operating fee', '48 hours, in a public queue'],
  ['A new screen pass', '48 hours before it counts'],
  ['A new credit rule (policy swap)', '7 days, with borrows paused meanwhile'],
])}
<ul>
<li>A queued change shows its new value and time in an event. After the delay, anyone can execute it, within a 7-day window; after that it lapses and must be queued again.</li>
<li>Hard bounds are checked when a change is queued and again when it executes.</li>
<li>Every change applies to new loans only.</li>
<li>Ownership moves in two steps, and renouncing ownership is disabled, so the restore levers can never be lost.</li>
</ul>
<h2>Hard bounds in code</h2>
${table(['Parameter', 'Bound'], [
  ['Flat fee, 7 days', '0.25% to 3%'],
  ['Flat fee, 14 days', '0.5% to 6%'],
  ['Minimum fee', '0.001 to 0.1 BEM'],
  ['Minimum advance', '0.001 to 1 BEM'],
  ['Late fee', '0 to 0.3% per day'],
  ['Reserve share / reserve cap', 'up to 50% / up to 20%'],
  ['Operating fee per term', '0 to 0.5 OKB'],
  ['Borrow cap', 'up to 90% of assets'],
  ['Per-borrower cap', 'up to 50% of assets'],
])}
<p>The launch values sit at the low end: 0.25% and 0.5% fees, 0.001 BEM minimum fee, 0 late fee, 0 OKB operating fee.</p>
<h2>Trust outside TapePool</h2>
<ul>
<li><strong>TapeOut's 3-of-5 multisig</strong> can upgrade the RIG vouchers and the rig vault on BSC, and can rescue a rig. TapePool cannot stop that. When the keeper sees an upgrade, it pauses new borrows; a rescue is treated as impairment.</li>
<li><strong>LayerZero</strong> carries rig data from BSC to X Layer, and the BEM bridge relies on it too. If it stops, new borrows stop; open loans keep repaying.</li>
<li><strong>PodMining</strong> is sealed (no owner). The keeper still watches its implementation.</li>
<li><strong>The app</strong> builds your transactions and your wallet signs them. Check every request in your wallet.</li>
</ul>`},

{id:'risks',group:'Trust and safety',title:'Risks',lead:'TapePool is new software. Read these risks before you supply or borrow.',body:`
<h2>If you supply BEM</h2>
<ul>
<li><strong>A rig can fail.</strong> If a rig behind a loan is revoked, stopped or rescued, the loan can default. The pool then takes the vouchers of that loan, and a small loss reserve covers part of the gap. Lenders carry the rest. Every rig needs a screen pass before it can borrow; that lowers the risk but does not remove it.</li>
<li><strong>Withdrawals use idle BEM.</strong> You can withdraw only BEM that is not lent out. While loans are open, you may wait for repayments. They come from mining, over 7 or 14 days.</li>
<li><strong>Loans can run late.</strong> A rig mines less when the network grows. A late loan keeps repaying from its rig and is never sold off. There is no late fee until at least December 7, 2026, so a late loan earns lenders nothing extra.</li>
<li><strong>Deposits stop while a loan is in trouble.</strong> When a loan is flagged, its unpaid principal comes out of the share value at once. New deposits stop until the loan is resolved. Withdrawals keep working, at the lower value.</li>
<li><strong>Everything is in BEM.</strong> Fees and losses are counted in BEM. Nothing here protects you from a fall in the BEM price.</li>
<li><strong>A few miners hold most rigs.</strong> Caps limit how much one borrower can take. Trouble at one large miner can still reach a large part of the pool.</li>
</ul>
<h2>If you borrow</h2>
<ul>
<li><strong>Your rig repays first.</strong> While the loan is open, your rig's mined BEM goes to the pool until the debt is paid. After that you get the rest and take your voucher back.</li>
<li><strong>A slow rig is never seized. A failed rig can be.</strong> If your rig is revoked, stopped or rescued, anyone can flag the loan. You then have 72 hours to repay in full. After that the pool can take every voucher in that loan's agent. The app gives each rig its own agent, so one rig's problem does not reach your other rigs.</li>
<li><strong>Fees are not refunded.</strong> The BEM fee is flat, and repaying early does not lower it. An operating fee in OKB, if it is ever above 0, is never refunded either.</li>
<li><strong>Harvest before you borrow.</strong> BEM your rig mined before the loan, if it is not harvested first, is paid to the agent and goes toward the debt. The app offers a harvest first.</li>
</ul>
<h2>Who can change what</h2>
<ul>
<li><strong>The TapePool owner</strong> can lower caps at once. Every other change, fees included, waits 48 hours in a public queue, within hard limits in the code. A new credit rule waits 7 days, and new borrows pause while it waits. No one can move pool funds or vouchers.</li>
<li><strong>The keeper</strong> harvests rigs, sweeps the mined BEM into the pool and flags failed rigs. Its key can pull only three brakes: pause new borrows, switch off the rig data feed, and suspend a rig. Only the owner can release them. If the keeper stops, anyone can do its work.</li>
<li><strong>TapeOut's multisig</strong> controls the rig vouchers, the rig vault on BSC and the circuits that judge rigs. It can upgrade them or rescue a rig, and TapePool cannot stop that. When the keeper sees an upgrade, it pauses new borrows.</li>
<li><strong>LayerZero</strong> carries rig data from BSC to X Layer. If that path stops, new borrows stop. Open loans keep repaying.</li>
<li><strong>The app</strong> builds your transactions, and your wallet signs them. Check every request in your wallet.</li>
</ul>
<p>Details: <a href="#admin">Who can change what</a>, <a href="#late-and-impaired">Late loans and impairment</a>, <a href="#share-value">Share value, fees and losses</a>.</p>`},

/* ───────────────────────── Reference ───────────────────────── */
{id:'contracts',group:'Reference',title:'Contract addresses',nav:'Contracts',lead:'The contracts TapePool deployed on X Layer and BSC. Compare an address here with the one in your wallet before you sign.',body:`
<p>These are the contracts in use today. Each address links to the block explorer of its chain: OKLink for X Layer, BscScan for BSC. Check the chain as well as the address: the rig data reporter is on BSC, every other contract is on X Layer.</p>
<h2>X Layer: the pool</h2>
<p>Deployed on November 16, 2026. Borrowing opened on November 18, 2026.</p>
${table(['Contract', 'Address', 'What it does'], [
  ['<code>TapePool</code> (tpBEM)', addr(C.pool), 'The pool. You deposit BEM here and receive tpBEM; this is also the tpBEM token address to add to your wallet.'],
  ['<code>AgentFactory</code>', addr(C.factory), 'Creates Rig Agents. Each agent is a separate contract with its own address, owned by one borrower.'],
  ['<code>RigAgent</code> implementation', addr(C.agentImpl), 'The code every Rig Agent runs. Each agent is a clone of it.'],
  ['<code>CreditPolicy</code>', addr(C.policy), 'Checks every advance against the policy circuit and its Solidity mirror.'],
  ['<code>RigScreen</code>', addr(C.screen), 'Registry of screen passes.'],
  ['<code>TapeLens</code>', addr(C.lens), 'Read-only helper: how much a rig can borrow, and why a borrow would be refused.'],
  ['Rig data receiver', addr(C.receiver), 'Receives rig reports from BSC over LayerZero. Locked: no owner, no LayerZero delegate.'],
])}
<h2>X Layer: the policy circuit</h2>
<p>TapePool's own TapeOut processor, "Tape Pool Policy", holds the credit rule as circuit ID <strong>1</strong> (44 NAND gates). See <a href="#credit-rule">The credit rule</a>.</p>
${table(['Contract', 'Address', 'What it does'], [
  ['Circuits contract of "Tape Pool Policy"', addr(C.circuits), 'Holds the policy circuit, ID 1. <code>CreditPolicy</code> evaluates it on every advance.'],
  ['Transistors contract of "Tape Pool Policy"', addr(C.transistors), 'The transistor contract of the same processor.'],
])}
<h2>BSC</h2>
${table(['Contract', 'Address', 'What it does'], [
  ['Rig data reporter', addr(C.reporter, 'bsc'), 'Reads each rig on BSC and sends its report to the receiver on X Layer. Locked: no owner, no LayerZero delegate.'],
])}
<p>The RIG vouchers, the BEM token and the rig vault are TapeOut's contracts, not TapePool's. See <a href="${TAPEOUT}" target="_blank" rel="noreferrer">TapeOut</a>.</p>`},

{id:'faq',group:'Reference',title:'FAQ',lead:'Short answers to the questions miners and lenders ask most.',body:`
<h2>General</h2>
<details><summary>Is TapePool an official TapeOut product?</summary><div><p>No. TapePool is an independent project built in the TapeOut ecosystem and running on X Layer. It uses TapeOut's rigs, vouchers and circuits.</p></div></details>
<details><summary>Is the app live?</summary><div><p>Yes. The app is at <a href="${APP}" target="_blank" rel="noreferrer">app.tapepool.io</a>, the contracts are live on X Layer mainnet and borrowing is open. See <a href="#status">Status and roadmap</a> and <a href="#contracts">Contract addresses</a>.</p></div></details>
<details><summary>Can a fall in the BEM price get my rig liquidated?</summary><div><p>No. The debt is in BEM and repaid in BEM, and there is no price oracle or auction. Only a rig proven impaired on chain can be seized, after a 72-hour window to repay. See <a href="#late-and-impaired">Late loans and impairment</a>.</p></div></details>
<details><summary>Does TapePool promise lenders a return?</summary><div><p>No. Lenders receive a share of the fees borrowers actually pay, released over 7 days, and carry the losses the reserve does not cover. Past share-value growth says nothing about the future.</p></div></details>
<h2>Borrowing</h2>
<details><summary>Why does my rig need 3 days and a screen pass?</summary><div><p>Revocation is the main way a loan can fail. The screen proves the official test vectors cannot revoke the rig, and the age rule is a second line behind it. See <a href="#screen">Revocation screen</a>.</p></div></details>
<details><summary>What happens if my rig mines less than expected?</summary><div><p>Nothing bad. A shortfall at maturity is not a default. The voucher stays in the agent and keeps repaying, and the keeper harvests every 72 hours until the debt is cleared. The late fee is 0 today.</p></div></details>
<details><summary>Can I repay early to pay less?</summary><div><p>You can repay early at any time, but the flat fee stays the same. It is the whole cost of the advance.</p></div></details>
<details><summary>Do I need BNB?</summary><div><p>Only if you harvest yourself or push a rig report yourself on BSC. The keeper pushes reports for you, and until December 15, 2026 it pays the LayerZero fees of pushes and scheduled harvests. On X Layer you need OKB for gas.</p></div></details>
<details><summary>Why does the advance go to my wallet and not to the agent?</summary><div><p>The pool always sends the advance to the agent's borrower, recorded by the factory. Nothing in a call can redirect it.</p></div></details>
<details><summary>I bridged my rig straight to my agent. Is it collateral?</summary><div><p>Not yet. A voucher that lands without the hook (bridging mints without it) is not registered. Use <em>Register</em> on the Rigs page while no loan is open, or take it back. Always bridge to your own wallet first.</p></div></details>
<details><summary>BEM arrived in my agent after I took the voucher back. Is it lost?</summary><div><p>No. Use <em>Claim late BEM</em>; it sends that BEM to you. See <a href="#repay">Repayment and release</a>.</p></div></details>
<h2>Lending</h2>
<details><summary>Why can't I withdraw everything right now?</summary><div><p>Withdrawals use idle BEM, the part that is not lent out. Loans repay from mining over 7 or 14 days. At least 30% of the pool stays idle when each loan is made.</p></div></details>
<details><summary>Why are deposits closed?</summary><div><p>Either the supply cap is reached, or a loan is flagged and marked doubtful. Deposits reopen when the loan is resolved. Withdrawals stay open.</p></div></details>
<details><summary>I supplied to an earlier TapePool pool. What now?</summary><div><p>Earlier pools are retired but not locked: anyone holding shares in them can still withdraw.</p></div></details>`},

{id:'glossary',group:'Reference',title:'Glossary',lead:'The words these docs and the app use.',body:`
<dl class="glossary">
<dt>Advance</dt><dd>The BEM a borrower receives. Also called the principal.</dd>
<dt>Backstop</dt><dd>The address holding the owner's seed shares, fixed at deploy. Total lending can never exceed the value of those shares.</dd>
<dt>Base power</dt><dd>A rig's verified weight without its design bonus. The only power TapePool lends against.</dd>
<dt>BEM</dt><dd>The token TapeOut rigs mine on BSC. On X Layer, a bridged version (an OFT with 8 decimals) is the pool's asset.</dd>
<dt>Bridge fee</dt><dd>0.5% of harvested BEM, kept by the BEM bridge when it reaches X Layer.</dd>
<dt>Credit rule</dt><dd>The public TapeOut circuit (Tape Pool Policy, circuit ID 1) that decides whether an advance is allowed. See <a href="#credit-rule">The credit rule</a>.</dd>
<dt>Cure window</dt><dd>The 72 hours after a flag in which the borrower can repay in full and keep the rigs.</dd>
<dt>Debt</dt><dd>Advance plus flat fee (plus any late fee). The cap of 85% or 80% applies to the whole debt.</dd>
<dt>Debt bucket</dt><dd>The debt as a share of expected output in 5% steps, as the circuit reads it.</dd>
<dt>Design bonus</dt><dd>Extra weight a rig gets for its design. Usually lost within hours, so it never counts toward a loan.</dd>
<dt>Doubtful</dt><dd>The remaining principal of a flagged loan, removed from the share value until the loan is resolved.</dd>
<dt>Expected base output</dt><dd>What a rig's base power is expected to mine over the term, after network growth and the bridge fee. See <a href="#terms">Terms and fees</a>.</dd>
<dt>Flag</dt><dd>A call, open to anyone, that marks a loan whose rig is proven impaired on chain. Starts the cure window.</dd>
<dt>Guardian</dt><dd>The keeper's key, which can pull three brakes and nothing else.</dd>
<dt>H</dt><dd>The unit of rig power.</dd>
<dt>Harvest</dt><dd>The BSC call that collects a rig's mined BEM and bridges it to whoever held the voucher when the harvest was sent.</dd>
<dt>Idle BEM</dt><dd>BEM in the pool that is not lent out and not in the reserve. Withdrawals and advances come from it.</dd>
<dt>Impaired</dt><dd>A rig that is revoked, stopped, rescued, out of the vault's custody or without base power, as shown by on-chain evidence.</dd>
<dt>Keeper</dt><dd>The team's off-chain bot: harvests, sweeps, report pushes and flags. Holds gas only.</dd>
<dt>LayerZero</dt><dd>The cross-chain messaging system that carries rig reports and the BEM bridge between BSC and X Layer.</dd>
<dt>Loss reserve</dt><dd>20% of each fee, up to 5% of pool assets, kept to absorb write-offs.</dd>
<dt>Maturity</dt><dd>Start of the loan plus 7 or 14 days. Derived from the term, never chosen by the borrower.</dd>
<dt>OKB</dt><dd>X Layer's gas token.</dd>
<dt>PodMining</dt><dd>TapeOut's mining contract on BSC. It verifies rigs and can revoke one through a challenge with an official test vector.</dd>
<dt>Release</dt><dd>The borrower-only call that returns the vouchers to the borrower's wallet once the debt is zero.</dd>
<dt>Rig</dt><dd>A TapeOut circuit that mines BEM on BSC.</dd>
<dt>Rig Agent</dt><dd>A small contract owned by one borrower that holds vouchers, carries one loan and passes harvests to the pool.</dd>
<dt>RIG voucher</dt><dd>The ERC-721 token on X Layer that stands for a bridged rig. Its holder receives the rig's harvests.</dd>
<dt>Screen pass</dt><dd>The owner's on-chain record that a rig matches every official test vector of its task. Counts 48 hours after it is recorded.</dd>
<dt>Seize</dt><dd>After the cure window, the call that moves a loan's vouchers to the pool, with evidence the rig is still impaired.</dd>
<dt>Sweep</dt><dd>The permissionless call that moves an agent's BEM into the pool: late fee, flat fee, then principal.</dd>
<dt>TapeOut Safe</dt><dd>TapeOut's 3-of-5 multisig, which can upgrade the vouchers and the rig vault and rescue a rig.</dd>
<dt>tpBEM</dt><dd>The pool's share token (ERC-4626, 14 decimals). Its value in BEM grows with fees paid.</dd>
<dt>X Layer</dt><dd>OKX's EVM network (chain 196) where the pool, the agents and the credit rule live.</dd>
</dl>`},
];
