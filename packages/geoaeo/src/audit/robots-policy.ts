interface RobotsRule {
  allow: boolean;
  path: string;
}

interface RobotsGroup {
  agents: string[];
  rules: RobotsRule[];
}

function literal(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** A rule path matches as a prefix; `*` is a wildcard and a trailing `$` anchors the end. */
function ruleMatches(rulePath: string, path: string): boolean {
  let pattern = rulePath;
  let anchored = false;
  if (pattern.endsWith('$')) {
    anchored = true;
    pattern = pattern.slice(0, -1);
  }
  const source = pattern.split('*').map(literal).join('.*');
  return new RegExp(`^${source}${anchored ? '$' : ''}`).test(path);
}

/**
 * Split a robots.txt body into its user-agent groups: the run of `User-agent`
 * lines, then the rules that follow. A non-agent record closes the agent list,
 * so the next `User-agent` line starts a new group.
 */
function parseGroups(robotsTxt: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let group: RobotsGroup | undefined;
  let sealed = true;
  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const match = /^([A-Za-z-]+)\s*:\s*(.*?)\s*$/.exec(rawLine.replace(/#.*$/, ''));
    if (!match) continue;
    const field = match[1].toLowerCase();
    const value = match[2];
    if (field === 'user-agent') {
      if (!group || sealed) {
        group = { agents: [], rules: [] };
        groups.push(group);
        sealed = false;
      }
      group.agents.push(value.split(/\s/)[0].toLowerCase());
      continue;
    }
    if (!group) continue;
    sealed = true;
    if ((field === 'allow' || field === 'disallow') && value) {
      group.rules.push({ allow: field === 'allow', path: value });
    }
  }
  return groups;
}

/** Rules that apply to an agent: its own groups when present, else the `*` groups. */
function rulesForAgent(groups: RobotsGroup[], agent: string): RobotsRule[] {
  const name = agent.toLowerCase();
  const named = groups.filter(group =>
    group.agents.some(ua => ua === name || ua.split('/')[0] === name),
  );
  const source = named.length ? named : groups.filter(group => group.agents.includes('*'));
  return source.flatMap(group => group.rules);
}

/** The longest match decides; on a tie the allow wins, per the robots RFC. */
function disallowsPath(rules: RobotsRule[], path: string): boolean {
  const matched = rules.filter(rule => ruleMatches(rule.path, path));
  if (!matched.length) return false;
  const best = Math.max(...matched.map(rule => rule.path.length));
  const decisive = matched.filter(rule => rule.path.length === best);
  return !decisive.some(rule => rule.allow) && decisive.some(rule => !rule.allow);
}

/** Named crawlers whose robots policy forbids fetching `path` (defaults to `/`). */
export function blockedAgents(robotsTxt: string, agents: readonly string[], path = '/'): string[] {
  const groups = parseGroups(robotsTxt);
  return agents.filter(agent => disallowsPath(rulesForAgent(groups, agent), path));
}
