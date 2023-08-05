# jira-add-attachments

The GitHub Actions for [Jira](https://www.atlassian.com/software/jira) to add attachement to existing JIRA issues.


## Requirements

- [`JIRA Login Action`](https://github.com/marketplace/actions/jira-login) - Log in to the Jira API
-  JIRA issue number for an existing JIRA issue.

## Example

```
on:
  push

name: Test Transition Issue

jobs:
  add-attachement-to-jira:
    name: Attachement
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@master

    - name: Login
      uses: atlassian/gajira-login@master
      env:
        JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
        JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
        JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}

    - name: Create
      id: create
      uses: atlassian/gajira-create@v3
      with:
        project: GA
        issuetype: Build
        summary: Build completed
        description: Compare branch
        fields: '{"customfield_10171": "test"}'

    - name: Add attachement to jira issue
      uses: z4ck404/jira-add-attachement@0.1.0
      with:
        issue: ${{ steps.create.outputs.issue }}
        attachmentFilePath: /path/to/attachement
```








