const YAML = require("yaml");
const core = require("@actions/core");
const fetch = require("node-fetch-commonjs");
const { FormData, File } = require("node-fetch-commonjs");
const { readFileSync } = require("fs");

function getLoginData() {
  const configPath = `${process.env.HOME}/jira/config.yml`;
  const login = YAML.parse(readFileSync(configPath, "utf8"));

  if (
    !login.baseUrl ||
    login.baseUrl.length === 0 ||
    !login.email ||
    login.email.length === 0 ||
    !login.token ||
    login.token.length === 0
  ) {
    throw new Error(
      "All login properties must be set. Did you configure the jira-login action properly?"
    );
  }

  return login;
}

function getInputs() {
  return {
    issue: core.getInput("issue"),
    attachmentPath: core.getInput("attachmentFilePath"),
  };
}

async function addAttachment() {
  const login = getLoginData();
  const inputs = getInputs();

  const formData = new FormData();
  const binary = new Uint8Array([97, 98, 99]);
  const abc = new File([binary], "abc.txt", { type: "text/plain" });

  formData.set("greeting", "Hello, world!");
  formData.set("file-upload", abc, "new name.txt");

  try {
    const res = await fetch(
      `${login.baseUrl}/rest/api/3/issue/${inputs.issue}/attachments`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${login.email}:${login.token}`
          ).toString("base64")}`,
          Accept: "application/json",
          "X-Atlassian-Token": "no-check",
        },
        body: formData,
      }
    );

    const parsedRes = await res.text();

    console.log("Response", parsedRes);
  } catch (err) {
    console.log("Error", err);
  }
}

addAttachment();
