import assert from "node:assert/strict";
import test from "node:test";
import { complete, createShell, execute, resolvePath } from "./shell";

test("portfolio files contain real records and never read host paths", () => {
  const shell = createShell();
  assert.match(execute(shell, "cat readme.txt").output, /Boston University/);
  assert.match(execute(shell, "cat projects/flowcast.md").output, /Flowcast/);
  assert.match(execute(shell, "cat experience/honeycake.md").output, /Honeycake/);
  assert.equal(execute(shell, "cat /Users/liem/.ssh/id_rsa").exitCode, 1);
  assert.match(execute(shell, "ls -a").output, /\.secrets/);
  assert.equal(resolvePath(shell, "../../../../../etc/./os-release"), "/etc/os-release");
});

test("quotes, escapes, variables, comments and runtime status", () => {
  const shell = createShell();
  const result = execute(shell, 'NAME="coffee person"; echo "$NAME" \'$NAME\' \\$NAME ""; false; echo $?\n# comment\necho bean#one');
  assert.equal(result.output, "coffee person $NAME $NAME \n1\nbean#one");
  assert.equal(execute(shell, "echo 'a;b|c > d'").output, "a;b|c > d");
  assert.equal(execute(shell, "printf '%s:%d\\n' hello 42").output, "hello:42");
  assert.equal(execute(shell, "FOO=local env | grep FOO").output, "FOO=local");
  assert.equal(execute(shell, 'echo "$FOO"').output, "");
});

test("short circuit chains and missing commands preserve exit semantics", () => {
  const shell = createShell();
  assert.equal(execute(shell, "false && echo no || echo yes; true || echo no && echo done").output, "yes\ndone");
  assert.equal(execute(shell, "not-a-command").exitCode, 127);
  assert.equal(execute(shell, "echo $?").output, "127");
  assert.equal(execute(shell, "echo missing | grep nope").exitCode, 1);
});

test("pipes, file creation, append and source scripts work together", () => {
  const shell = createShell();
  assert.equal(execute(shell, "printf 'pear\\napple\\npear\\n' | sort | uniq > notes/fruit.txt; echo plum >> notes/fruit.txt; cat notes/fruit.txt | wc -l").output, "3");
  assert.equal(execute(shell, "cat notes/fruit.txt | head -n 1").output, "apple");
  assert.equal(execute(shell, "cat notes/fruit.txt | tail -n 1").output, "plum");
  assert.equal(execute(shell, "sh notes/welcome.sh").output, "Hello, visitor.\nThe coffee is ready.");
  assert.equal(shell.env.NAME, "visitor");
  assert.equal(shell.history.length, 4);
});

test("filesystem operations are normalized and protect directories and ancestors", () => {
  const shell = createShell();
  assert.equal(execute(shell, "mkdir -p notes/a/b; echo cup > notes/a/b/drink; cp -r notes/a notes/c; mv notes/c/b/drink notes/c/b/coffee; cat notes/c/b/coffee").output, "cup");
  assert.equal(execute(shell, "cp -r notes/a notes/a/nested").exitCode, 1);
  assert.equal(execute(shell, "mkdir notes/c/b/drink; cp notes/a/b/drink notes/c/b").exitCode, 1);
  assert.equal(shell.filesystem.get("/home/liem/notes/c/b/drink")?.kind, "directory");
  assert.equal(execute(shell, "echo bad > /etc/os-release").exitCode, 1);
  assert.equal(execute(shell, "cd notes/a/b; rm -r ../..").exitCode, 1);
  assert.equal(execute(shell, "mv .. ~/moved").exitCode, 1);
  execute(shell, "cd ~; rm -r notes/c");
  assert.equal(shell.filesystem.has("/home/liem/notes/c"), false);
});

test("invalid syntax is rejected before any command executes", () => {
  for (const input of ['touch notes/no; echo "unclosed', "touch notes/no; echo hi |", "touch notes/no; echo $(pwd)", "touch notes/no; echo `pwd`", "touch notes/no; cat < readme.txt"]) {
    const shell = createShell();
    assert.equal(execute(shell, input).exitCode, 1, input);
    assert.equal(shell.filesystem.has("/home/liem/notes/no"), false, input);
  }
});

test("clear removes earlier output, including when used in nested scripts", () => {
  const shell = createShell();
  assert.deepEqual(execute(shell, "echo before; clear; echo after"), { output: "after", clear: true, openApps: [], exitCode: 0 });
  execute(shell, "echo 'echo inside-before; clear; echo inside-after' > notes/clear.sh");
  assert.equal(execute(shell, "echo before; sh notes/clear.sh; echo after").output, "inside-after\nafter");
});

test("resource limits stop recursion, huge input, file growth and long scripts", () => {
  const shell = createShell();
  execute(shell, "echo 'sh notes/loop.sh' > notes/loop.sh");
  assert.match(execute(shell, "sh notes/loop.sh").output, /nesting limit/);
  assert.match(execute(shell, "echo " + "x".repeat(17000)).output, /Input limit/);
  assert.match(execute(shell, Array.from({ length: 130 }, () => "true").join(";")).output, /budget exceeded/);
  execute(shell, "echo '" + "x".repeat(16000) + "' > notes/big");
  assert.equal(execute(shell, "cat notes/big >> notes/big").exitCode, 0);
  assert.equal(execute(shell, "cat notes/big >> notes/big").exitCode, 1);
  assert.equal(execute(shell, "cat notes/big | wc -c").output, "32002");
});

test("completion handles commands, paths, spaces, hidden files and apps", () => {
  const shell = createShell();
  assert.equal(complete(shell, "fastf").value, "fastfetch ");
  assert.equal(complete(shell, "cat proj").value, "cat projects/");
  assert.equal(complete(shell, "cat .sec").value, "cat .secrets ");
  assert.equal(complete(shell, "open gue").value, "open guestbook ");
  execute(shell, "echo tea > 'notes/a drink'");
  assert.equal(complete(shell, "cat notes/a").value, "cat notes/a\\ drink ");
  assert.equal(execute(shell, complete(shell, "cat notes/a").value).output, "tea");
});

test("desktop requests and off-menu commands remain plain text", () => {
  const shell = createShell();
  assert.deepEqual(execute(shell, "open terminal; open chess; open liemfish; open help").openApps, ["about", "chess", "help"]);
  assert.match(execute(shell, "fastfetch").output, /Engineering Undecided/);
  assert.match(execute(shell, "coffee espresso").output, /18 g/);
  assert.match(execute(shell, "fortune | cowsay").output, /\^__\^/);
  assert.match(execute(shell, "sudo make me a sandwich").output, /grilled cheese/);
});

test("Easter eggs dispatch desktop effects only when their command executes", () => {
  const shell = createShell();
  for (const name of ["nightcity", "relic", "blackwall", "sandevistan", "matrix"]) {
    assert.equal(execute(shell, name).effect, name);
  }
  assert.equal(execute(shell, "false && relic").effect, undefined);
  assert.equal(execute(shell, "echo relic").effect, undefined);
  assert.equal(execute(shell, "relic; nightcity").effect, "nightcity");
  execute(shell, "echo sandevistan > notes/chrome.sh");
  assert.equal(execute(shell, "sh notes/chrome.sh").effect, "sandevistan");
  assert.deepEqual(execute(shell, "fixer").openApps, ["guestbook"]);
  assert.equal(execute(shell, "fixer").sound, "fixer");
  assert.equal(execute(shell, "false && fixer").sound, undefined);
  assert.equal(execute(shell, "echo fixer").sound, undefined);
});
