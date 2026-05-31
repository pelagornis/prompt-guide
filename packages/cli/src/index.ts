#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import { addAgentCommand } from "./commands/add/agent.js";
import { addRuleCommand } from "./commands/add/rule.js";
import { addSkillCommand } from "./commands/add/skill.js";
import { doctorCommand } from "./commands/doctor.js";
import { diffCommand } from "./commands/diff.js";
import { initCommand } from "./commands/init.js";
import { statusCommand } from "./commands/status.js";
import { syncCommand } from "./commands/sync.js";
import { validateCommand } from "./commands/validate.js";

const main = defineCommand({
  meta: { name: "prompt-guide", description: "Unified AI tool configuration" },
  subCommands: {
    init: initCommand,
    sync: syncCommand,
    diff: diffCommand,
    validate: validateCommand,
    doctor: doctorCommand,
    status: statusCommand,
    add: defineCommand({
      meta: { description: "Add configuration entries" },
      subCommands: {
        skill: addSkillCommand,
        rule: addRuleCommand,
        agent: addAgentCommand,
      },
    }),
  },
});

runMain(main);
