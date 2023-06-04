import YAML from "yaml";
import * as core from "@actions/core";
import fetch from "node-fetch";
import FormData from "form-data";
import { readFileSync, createReadStream, statSync } from "fs";

function getLoginData() {
  const configPath = `${process.env.HOME}/jira/config.yml`;
  const login: {
    baseUrl: string;
    email: string;
    token: string;
  } = YAML.parse(readFileSync(configPath, "utf8"));

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

  const filePath = inputs.attachmentPath;
  const formData = new FormData();
  const stats = statSync(filePath);
  const fileSizeInBytes = stats.size;
  const fileStream = createReadStream(filePath);

  formData.append("file", fileStream, { knownLength: fileSizeInBytes });

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

    console.log(`Res: ${res.status} ${res.statusText}`);
  } catch (err) {
    console.log("Error", err);
  }
}

addAttachment();
