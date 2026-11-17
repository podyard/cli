/**
 * Unit tests for CLI command registration and basic behavior.
 * Mocks the PodyardClient to test command logic without hitting the API.
 */

import { Command } from "commander";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock the SDK so commands don't make real HTTP calls
// ---------------------------------------------------------------------------

const mockPods = {
  list: vi.fn(),
  create: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  exec: vi.fn(),
  snapshot: vi.fn(),
  fork: vi.fn(),
  listSnapshots: vi.fn(),
  sleep: vi.fn(),
  wake: vi.fn(),
  fs: {
    read: vi.fn(),
    write: vi.fn(),
    delete: vi.fn(),
  },
};

const mockSnapshots = {
  get: vi.fn(),
  fork: vi.fn(),
};

const mockTemplates = {
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
};

const mockUsage = {
  list: vi.fn(),
};

const mockLimits = {
  get: vi.fn(),
};

const mockKeys = {
  list: vi.fn(),
  create: vi.fn(),
  revoke: vi.fn(),
};

const mockWebhooks = {
  list: vi.fn(),
  create: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

const mockClient = {
  pods: mockPods,
  snapshots: mockSnapshots,
  templates: mockTemplates,
  usage: mockUsage,
  limits: mockLimits,
  keys: mockKeys,
  webhooks: mockWebhooks,
};

vi.mock("@podyard/sdk", () => ({
  PodyardClient: vi.fn(() => mockClient),
}));

// ---------------------------------------------------------------------------
// Import command modules after the mock is registered
// ---------------------------------------------------------------------------

const { registerPodCommands } = await import("../src/commands/pods");
const { registerSnapshotCommands } = await import("../src/commands/snapshots");
const { registerTemplateCommands } = await import("../src/commands/templates");
const { registerUsageCommands } = await import("../src/commands/usage");
const { registerLimitCommands } = await import("../src/commands/limits");
const { registerKeyCommands } = await import("../src/commands/keys");
const { registerWebhookCommands } = await import("../src/commands/webhooks");
const { registerLoginCommands } = await import("../src/commands/login");
const { registerConfigCommands } = await import("../src/commands/config");
const { registerInitCommand } = await import("../src/commands/init");

function makeCtx() {
  const logs: string[] = [];
  const log = vi
    .spyOn(console, "log")
    .mockImplementation((...args: unknown[]) => {
      logs.push(args.join(" "));
    });
  // Suppress console.error to keep test output clean.
  vi.spyOn(console, "error").mockImplementation(() => undefined);

  return {
    logs,
    log,
    ctx: {
      client: () => mockClient,
      print: (value: unknown, json: boolean, human?: () => void) => {
        if (json) {
          log(JSON.stringify(value));
        } else if (human) {
          human();
        }
      },
    },
  };
}

function makeProgram(): Command {
  return new Command().exitOverride();
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// pods
// ---------------------------------------------------------------------------

describe("pods commands", () => {
  it("registers pods subcommands", () => {
    const program = makeProgram();
    registerPodCommands(program, makeCtx().ctx);
    const podsCmd = program.commands.find((c) => c.name() === "pods");
    expect(podsCmd).toBeDefined();
    const names = (podsCmd as Command).commands.map((c) => c.name());
    expect(names).toContain("list");
    expect(names).toContain("create");
    expect(names).toContain("get");
    expect(names).toContain("destroy");
    expect(names).toContain("exec");
    expect(names).toContain("snapshot");
    expect(names).toContain("fork");
    expect(names).toContain("sleep");
    expect(names).toContain("wake");
    // fs is a subcommand group
    expect(names).toContain("fs");
  });

  it("pods list calls client.pods.list", async () => {
    const { ctx, log } = makeCtx();
    mockPods.list.mockResolvedValue({
      items: [{ id: "pod_1", status: "running", name: "test" }],
    });

    const program = makeProgram();
    registerPodCommands(program, ctx);

    await program.parseAsync(["node", "podyard", "pods", "list"]);

    expect(mockPods.list).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalled();
  });

  it("pods list with --json outputs JSON", async () => {
    const { ctx } = makeCtx();
    mockPods.list.mockResolvedValue({
      items: [{ id: "pod_1", status: "running", name: "test" }],
    });

    const program = makeProgram();
    registerPodCommands(program, ctx);

    await program.parseAsync(["node", "podyard", "pods", "list", "--json"]);

    // The print function should have been called with json=true
    expect(mockPods.list).toHaveBeenCalledOnce();
  });

  it("pods create calls client.pods.create with correct body", async () => {
    const { ctx } = makeCtx();
    mockPods.create.mockResolvedValue({
      id: "pod_new",
      status: "running",
      name: "my-pod",
    });

    const program = makeProgram();
    registerPodCommands(program, ctx);

    await program.parseAsync([
      "node",
      "podyard",
      "pods",
      "create",
      "-n",
      "my-pod",
      "--template",
      "tpl_1",
    ]);

    expect(mockPods.create).toHaveBeenCalledWith({
      name: "my-pod",
      templateId: "tpl_1",
    });
  });

  it("pods exec builds ExecRequest correctly", async () => {
    const { ctx } = makeCtx();
    mockPods.exec.mockResolvedValue({
      exitCode: 0,
      stdout: "hello\n",
      stderr: "",
      durationMs: 42,
    });

    const program = makeProgram();
    registerPodCommands(program, ctx);

    await program.parseAsync([
      "node",
      "podyard",
      "pods",
      "exec",
      "pod_1",
      "echo",
      "hello",
      "--cwd",
      "/tmp",
      "--timeout",
      "30",
    ]);

    expect(mockPods.exec).toHaveBeenCalledWith("pod_1", {
      argv: ["echo", "hello"],
      cwd: "/tmp",
      timeoutSeconds: 30,
    });
  });

  it("pods sleep calls client.pods.sleep", async () => {
    const { ctx } = makeCtx();
    mockPods.sleep.mockResolvedValue({
      id: "pod_1",
      status: "sleeping",
      name: "x",
    });

    const program = makeProgram();
    registerPodCommands(program, ctx);

    await program.parseAsync(["node", "podyard", "pods", "sleep", "pod_1"]);

    expect(mockPods.sleep).toHaveBeenCalledWith("pod_1");
  });

  it("pods snapshots calls client.pods.listSnapshots", async () => {
    const { ctx } = makeCtx();
    mockPods.listSnapshots.mockResolvedValue({
      items: [{ id: "snap_1", sizeBytes: 1024, createdAt: "2026-01-01" }],
    });

    const program = makeProgram();
    registerPodCommands(program, ctx);

    await program.parseAsync(["node", "podyard", "pods", "snapshots", "pod_1"]);

    expect(mockPods.listSnapshots).toHaveBeenCalledWith("pod_1", {});
  });

  it("pods wake calls client.pods.wake", async () => {
    const { ctx } = makeCtx();
    mockPods.wake.mockResolvedValue({
      id: "pod_1",
      status: "running",
      name: "x",
    });

    const program = makeProgram();
    registerPodCommands(program, ctx);

    await program.parseAsync(["node", "podyard", "pods", "wake", "pod_1"]);

    expect(mockPods.wake).toHaveBeenCalledWith("pod_1");
  });
});

// ---------------------------------------------------------------------------
// snapshots
// ---------------------------------------------------------------------------

describe("snapshots commands", () => {
  it("registers snapshot subcommands (get, fork — no list/delete)", () => {
    const program = makeProgram();
    registerSnapshotCommands(program, makeCtx().ctx);
    const snapsCmd = program.commands.find((c) => c.name() === "snapshots");
    expect(snapsCmd).toBeDefined();
    const names = (snapsCmd as Command).commands.map((c) => c.name());
    expect(names).toContain("get");
    expect(names).toContain("fork");
    // list and delete are not yet supported by the engine
    expect(names).not.toContain("list");
    expect(names).not.toContain("delete");
  });

  it("snapshots get calls client.snapshots.get", async () => {
    const { ctx } = makeCtx();
    mockSnapshots.get.mockResolvedValue({
      id: "snap_1",
      podId: "pod_1",
      sizeBytes: 1024,
      createdAt: "2026-01-01T00:00:00Z",
    });

    const program = makeProgram();
    registerSnapshotCommands(program, ctx);

    await program.parseAsync(["node", "podyard", "snapshots", "get", "snap_1"]);

    expect(mockSnapshots.get).toHaveBeenCalledWith("snap_1");
  });

  it("snapshots fork calls client.snapshots.fork", async () => {
    const { ctx } = makeCtx();
    mockSnapshots.fork.mockResolvedValue({
      children: [
        { id: "pod_a", status: "running" },
        { id: "pod_b", status: "running" },
      ],
    });

    const program = makeProgram();
    registerSnapshotCommands(program, ctx);

    await program.parseAsync([
      "node",
      "podyard",
      "snapshots",
      "fork",
      "snap_1",
      "--n",
      "2",
    ]);

    expect(mockSnapshots.fork).toHaveBeenCalledWith("snap_1", { count: 2 });
  });
});

// ---------------------------------------------------------------------------
// templates
// ---------------------------------------------------------------------------

describe("templates commands", () => {
  it("registers template subcommands", () => {
    const program = makeProgram();
    registerTemplateCommands(program, makeCtx().ctx);
    const tplsCmd = program.commands.find((c) => c.name() === "templates");
    expect(tplsCmd).toBeDefined();
    const names = (tplsCmd as Command).commands.map((c) => c.name());
    expect(names).toContain("list");
    expect(names).toContain("get");
    expect(names).toContain("create");
    expect(names).toContain("delete");
  });

  it("templates list calls client.templates.list", async () => {
    const { ctx } = makeCtx();
    mockTemplates.list.mockResolvedValue({
      items: [
        {
          id: "tpl_1",
          name: "base",
          visibility: "private",
          snapshotId: "snap_1",
        },
      ],
    });

    const program = makeProgram();
    registerTemplateCommands(program, ctx);

    await program.parseAsync(["node", "podyard", "templates", "list"]);

    expect(mockTemplates.list).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// usage
// ---------------------------------------------------------------------------

describe("usage commands", () => {
  it("registers usage list subcommand", () => {
    const program = makeProgram();
    registerUsageCommands(program, makeCtx().ctx);
    const usageCmd = program.commands.find((c) => c.name() === "usage");
    expect(usageCmd).toBeDefined();
    const names = (usageCmd as Command).commands.map((c) => c.name());
    expect(names).toContain("list");
  });
});

// ---------------------------------------------------------------------------
// limits
// ---------------------------------------------------------------------------

describe("limits commands", () => {
  it("registers limits command at top level", () => {
    const program = makeProgram();
    registerLimitCommands(program, makeCtx().ctx);
    const limitsCmd = program.commands.find((c) => c.name() === "limits");
    expect(limitsCmd).toBeDefined();
  });

  it("limits calls client.limits.get", async () => {
    const { ctx } = makeCtx();
    mockLimits.get.mockResolvedValue({
      plan: {
        name: "hobby",
        priceMonthlyCents: 1000,
        limits: {
          maxConcurrentPods: 3,
          maxSnapshotCount: 10,
          rateLimitRpm: 60,
          webhooksPerKey: 5,
          execTimeoutSeconds: 300,
          maxPodSizeGb: 10,
          fsMaxFileSizeMb: 100,
          maxLifetimeHours: 72,
          sleepAfterMinutes: 30,
        },
      },
      currentUsage: {
        concurrentPods: 1,
        snapshots: 2,
        execsToday: 50,
        webhooks: 1,
      },
    });

    const program = makeProgram();
    registerLimitCommands(program, ctx);

    await program.parseAsync(["node", "podyard", "limits"]);

    expect(mockLimits.get).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// keys
// ---------------------------------------------------------------------------

describe("keys commands", () => {
  it("registers keys subcommands", () => {
    const program = makeProgram();
    registerKeyCommands(program, makeCtx().ctx);
    const keysCmd = program.commands.find((c) => c.name() === "keys");
    expect(keysCmd).toBeDefined();
    const names = (keysCmd as Command).commands.map((c) => c.name());
    expect(names).toContain("list");
    expect(names).toContain("create");
    expect(names).toContain("revoke");
  });

  it("keys revoke calls client.keys.revoke", async () => {
    const { ctx } = makeCtx();
    mockKeys.revoke.mockResolvedValue({ ok: true });

    const program = makeProgram();
    registerKeyCommands(program, ctx);

    await program.parseAsync(["node", "podyard", "keys", "revoke", "key_1"]);

    expect(mockKeys.revoke).toHaveBeenCalledWith("key_1");
  });
});

// ---------------------------------------------------------------------------
// login / config
// ---------------------------------------------------------------------------

describe("login commands", () => {
  it("registers login and logout", () => {
    const program = makeProgram();
    registerLoginCommands(program);
    const names = program.commands.map((c) => c.name());
    expect(names).toContain("login");
    expect(names).toContain("logout");
  });
});

describe("config commands", () => {
  it("registers config subcommands", () => {
    const program = makeProgram();
    registerConfigCommands(program);
    const configCmd = program.commands.find((c) => c.name() === "config");
    expect(configCmd).toBeDefined();
    const names = (configCmd as Command).commands.map((c) => c.name());
    expect(names).toContain("get");
    expect(names).toContain("set");
    expect(names).toContain("path");
  });
});

// ---------------------------------------------------------------------------
// init
// ---------------------------------------------------------------------------

describe("init command", () => {
  it("registers the init command at top level", () => {
    const program = makeProgram();
    registerInitCommand(program);
    const initCmd = program.commands.find((c) => c.name() === "init");
    expect(initCmd).toBeDefined();
  });

  it("init scaffolds files in a temp directory", async () => {
    const { mkdtempSync, rmSync, existsSync, readFileSync } = await import(
      "node:fs"
    );
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");

    const tempDir = mkdtempSync(join(tmpdir(), "podyard-init-test-"));
    const projectDir = join(tempDir, "my-project");

    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit called");
    }) as never);

    try {
      const program = makeProgram();
      registerInitCommand(program);

      // Run init with --dir pointing at our temp dir
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      await program.parseAsync([
        "node",
        "podyard",
        "init",
        "my-project",
        "--dir",
        tempDir,
      ]);

      process.chdir(originalCwd);

      // Assert files were created
      expect(existsSync(join(projectDir, "podyard.json"))).toBe(true);
      expect(existsSync(join(projectDir, ".env.example"))).toBe(true);
      expect(existsSync(join(projectDir, ".gitignore"))).toBe(true);
      expect(existsSync(join(projectDir, "example.mjs"))).toBe(true);
      expect(existsSync(join(projectDir, "README.md"))).toBe(true);

      // podyard.json should have the right name
      const manifest = JSON.parse(
        readFileSync(join(projectDir, "podyard.json"), "utf-8")
      );
      expect(manifest.name).toBe("my-project");

      // .env.example should mention PODYARD_API_KEY
      const envExample = readFileSync(
        join(projectDir, ".env.example"),
        "utf-8"
      );
      expect(envExample).toContain("PODYARD_API_KEY");
    } finally {
      exitSpy.mockRestore();
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("init with --lang python creates example.py", async () => {
    const { mkdtempSync, rmSync, existsSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");

    const tempDir = mkdtempSync(join(tmpdir(), "podyard-init-py-"));
    const projectDir = join(tempDir, "py-project");

    try {
      const program = makeProgram();
      registerInitCommand(program);

      await program.parseAsync([
        "node",
        "podyard",
        "init",
        "py-project",
        "--lang",
        "python",
        "--dir",
        tempDir,
      ]);

      expect(existsSync(join(projectDir, "example.py"))).toBe(true);
      expect(existsSync(join(projectDir, "example.mjs"))).toBe(false);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// webhooks
// ---------------------------------------------------------------------------

describe("webhooks", () => {
  const fakeWebhook = {
    id: "wh_1",
    url: "https://example.com/hook",
    events: ["pod.created"],
    active: true,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  it("webhooks list calls client.webhooks.list", async () => {
    const { ctx } = makeCtx();
    mockWebhooks.list.mockResolvedValue({ items: [fakeWebhook] });

    const program = makeProgram();
    registerWebhookCommands(program, ctx);

    await program.parseAsync(["node", "podyard", "webhooks", "list"]);

    expect(mockWebhooks.list).toHaveBeenCalledWith({});
  });

  it("webhooks create calls client.webhooks.create with parsed events", async () => {
    const { ctx } = makeCtx();
    mockWebhooks.create.mockResolvedValue(fakeWebhook);

    const program = makeProgram();
    registerWebhookCommands(program, ctx);

    await program.parseAsync([
      "node",
      "podyard",
      "webhooks",
      "create",
      "https://example.com/hook",
      "--events",
      "pod.created, pod.destroyed",
    ]);

    expect(mockWebhooks.create).toHaveBeenCalledWith({
      url: "https://example.com/hook",
      events: ["pod.created", "pod.destroyed"],
    });
  });

  it("webhooks get calls client.webhooks.get", async () => {
    const { ctx } = makeCtx();
    mockWebhooks.get.mockResolvedValue(fakeWebhook);

    const program = makeProgram();
    registerWebhookCommands(program, ctx);

    await program.parseAsync(["node", "podyard", "webhooks", "get", "wh_1"]);

    expect(mockWebhooks.get).toHaveBeenCalledWith("wh_1");
  });

  it("webhooks delete calls client.webhooks.delete", async () => {
    const { ctx } = makeCtx();
    mockWebhooks.delete.mockResolvedValue(undefined);

    const program = makeProgram();
    registerWebhookCommands(program, ctx);

    await program.parseAsync(["node", "podyard", "webhooks", "delete", "wh_1"]);

    expect(mockWebhooks.delete).toHaveBeenCalledWith("wh_1");
  });
});
