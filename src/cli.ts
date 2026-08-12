#!/usr/bin/env node
import { Command } from 'commander';
import { auditTarget, formatAuditReport } from './audit.js';
import { PKG_NAME, VERSION } from './constants.js';
import { initProject } from './commands/init.js';
import { generateArtifact, type GeneratedArtifact } from './commands/gen.js';
import { humanizeGlob } from './commands/humanize.js';

const program = new Command();

program.name(PKG_NAME).version(VERSION).description('GEO and AEO site artifacts for answer engines and agents.');

program
  .command('audit <target>')
  .description('Audit a live URL or local site directory.')
  .option('--json', 'print JSON instead of the report')
  .action(async (target: string, options: { json?: boolean }) => {
    const report = await auditTarget(target);
    process.stdout.write(options.json ? `${JSON.stringify(report, null, 2)}\n` : `${formatAuditReport(report)}\n`);
  });

program
  .command('init [directory]')
  .description('Scaffold GEO and AEO artifacts into a Next.js or static site.')
  .option('--force', 'overwrite existing generated files')
  .action(async (directory = '.', options: { force?: boolean }) => {
    const result = await initProject({ directory, force: options.force });
    process.stdout.write(`${result.mode} project: created ${result.created.length}, skipped ${result.skipped.length}\n`);
  });

program
  .command('gen <artifact>')
  .description('Generate one artifact from the local site config.')
  .option('-o, --output <file>', 'write to a file instead of stdout')
  .option('--type <kind>', 'JSON-LD kind: software, product, faq, or breadcrumb', 'software')
  .action(async (artifact: string, options: { output?: string; type: string }) => {
    const allowed = ['llms', 'llms-full', 'jsonld', 'webmcp', 'sitemap', 'robots'];
    if (!allowed.includes(artifact)) throw new Error(`Unknown artifact: ${artifact}`);
    const content = await generateArtifact(artifact as GeneratedArtifact, process.cwd(), options.type as 'software' | 'product' | 'faq' | 'breadcrumb');
    if (options.output) {
      const { writeFile } = await import('node:fs/promises');
      await writeFile(options.output, content, 'utf8');
    } else {
      process.stdout.write(content);
    }
  });

program
  .command('humanize <glob>')
  .description('Find AI-writing tells in copy files.')
  .option('--check', 'report only and exit non-zero when tells are found')
  .option('--write', 'rewrite prose files in place')
  .action(async (pattern: string, options: { check?: boolean; write?: boolean }) => {
    const results = await humanizeGlob(pattern, { write: options.write });
    let findings = 0;
    for (const [file, result] of results) {
      findings += result.findings.length;
      if (result.findings.length) process.stdout.write(`${file}: ${result.findings.length} finding(s)\n`);
    }
    if (options.check || !options.write) process.exitCode = findings ? 1 : 0;
  });

program
  .command('mcp')
  .description('Run the MCP server over stdio.')
  .action(async () => {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
  });

program.parseAsync().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
