# Exo BDD Specification

**Version:** 0.1.0-draft  
**Status:** RFC  

A language-agnostic, application-agnostic Behavior-Driven Development testing framework for external/black-box testing.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Core Concepts](#core-concepts)
3. [Feature File Format](#feature-file-format)
4. [Adapter Architecture](#adapter-architecture)
5. [Configuration](#configuration)
6. [Built-in Adapters](#built-in-adapters)
7. [Assertions](#assertions)
8. [Hooks & Lifecycle](#hooks--lifecycle)
9. [Variables & State](#variables--state)
10. [Reporting](#reporting)
11. [CLI Interface](#cli-interface)
12. [Extension Points](#extension-points)

---

## 1. Philosophy

### Guiding Principles

1. **External-Only Testing**: All tests interact with systems as a user or client would—no internal code access, mocking, or instrumentation required.

2. **Language Agnostic**: The framework itself has no opinion about what language the system-under-test (SUT) is written in. Tests are defined in Gherkin and executed via protocol adapters.

3. **Declarative Over Imperative**: Test authors describe *what* should happen, not *how*. Implementation details live in adapters.

4. **Composable Adapters**: Each interaction type (HTTP, CLI, Browser, DB, Security) is handled by a pluggable adapter with a consistent interface.

5. **Zero SUT Modification**: The framework never requires changes to the application being tested.

---

## 2. Core Concepts

### 2.1 System Under Test (SUT)

The external system being tested. Defined in configuration with connection details.

```yaml
systems:
  api:
    adapter: http
    base_url: http://localhost:3000
  
  cli:
    adapter: shell
    working_dir: /path/to/app
    
  web:
    adapter: browser
    base_url: http://localhost:3000
```

### 2.2 Adapters

Plugins that know how to interact with specific protocols/interfaces. Each adapter:
- Registers step definitions it can handle
- Maintains its own session state
- Reports structured results

### 2.3 Scenarios

Gherkin scenarios that describe behavior using Given/When/Then steps. Steps are matched to adapter actions via patterns.

### 2.4 World

A shared context object passed through a scenario's lifecycle, holding:
- Variables extracted from responses
- Adapter sessions
- Scenario metadata

---

## 3. Feature File Format

Standard Gherkin with extensions for external testing.

### 3.1 Basic Structure

```gherkin
@api @smoke
Feature: User Authentication
  As an API consumer
  I want to authenticate users
  So that I can access protected resources

  Background:
    Given the "api" system is available

  Scenario: Successful login
    Given I set header "Content-Type" to "application/json"
    When I POST to "/auth/login" with body:
      """json
      {
        "email": "user@example.com",
        "password": "secret123"
      }
      """
    Then the response status should be 200
    And the response body should match schema "auth/login-response.json"
    And I store "response.body.token" as "auth_token"

  Scenario: Access protected resource
    Given I set header "Authorization" to "Bearer ${auth_token}"
    When I GET "/users/me"
    Then the response status should be 200
    And the response body path "$.email" should equal "user@example.com"
```

### 3.2 Adapter-Specific Steps

Steps are prefixed or tagged to route to the correct adapter:

```gherkin
# HTTP Adapter
When I GET "/users"
When I POST to "/users" with body:

# CLI Adapter  
When I run command "myapp --version"
When I run command "myapp create user" with stdin:

# Browser Adapter
When I navigate to "/login"
When I click the "Submit" button
When I fill "Email" with "user@example.com"

# Database Adapter
Given the database has user with email "test@example.com"
Then the database should have 1 record in "users" where "email = 'test@example.com'"

# Security Adapter
When I scan "/api" for SQL injection vulnerabilities
Then no critical vulnerabilities should be found
```

### 3.3 Data Tables

```gherkin
Scenario Outline: Multiple user types can login
  When I POST to "/auth/login" with body:
    """json
    {"email": "<email>", "password": "<password>"}
    """
  Then the response status should be <status>

  Examples:
    | email              | password  | status |
    | admin@example.com  | admin123  | 200    |
    | user@example.com   | user123   | 200    |
    | invalid@email.com  | wrong     | 401    |
```

### 3.4 Multi-System Scenarios

```gherkin
Scenario: CLI creates user visible in API
  # CLI interaction
  Given I use the "cli" system
  When I run command "myapp user create --email=new@example.com"
  Then the exit code should be 0
  
  # API verification
  Given I use the "api" system
  When I GET "/users?email=new@example.com"
  Then the response status should be 200
  And the response body path "$.users[0].email" should equal "new@example.com"
```

---

## 4. Adapter Architecture

### 4.1 Adapter Interface

Every adapter must implement this interface (pseudocode):

```
interface Adapter {
  // Metadata
  name: string
  version: string
  protocols: string[]  // e.g., ["http", "https", "graphql"]
  
  // Lifecycle
  initialize(config: AdapterConfig): Promise<void>
  createSession(world: World): Promise<Session>
  destroySession(session: Session): Promise<void>
  shutdown(): Promise<void>
  
  // Step registration
  getStepDefinitions(): StepDefinition[]
  
  // Health check
  healthCheck(config: SystemConfig): Promise<HealthResult>
}

interface StepDefinition {
  pattern: RegExp | string
  type: "Given" | "When" | "Then"
  execute(session: Session, matches: string[], docString?: string, dataTable?: DataTable): Promise<StepResult>
}

interface StepResult {
  status: "passed" | "failed" | "skipped" | "pending"
  duration_ms: number
  error?: Error
  attachments?: Attachment[]  // screenshots, logs, etc.
  extracted?: Record<string, any>  // variables to store in world
}
```

### 4.2 Adapter Discovery

Adapters are discovered via:

1. **Built-in**: Shipped with the framework
2. **NPM/Package**: Installed as `exo-bdd-adapter-*`
3. **Local**: Defined in `./adapters/` directory
4. **Remote**: HTTP-based adapter services (for non-JS ecosystems)

### 4.3 Remote Adapter Protocol

For adapters written in other languages, a JSON-RPC-like protocol over HTTP:

```
POST /adapter/execute-step
Content-Type: application/json

{
  "session_id": "abc123",
  "step": {
    "type": "When",
    "text": "I GET \"/users\"",
    "matches": ["/users"]
  },
  "world": {
    "variables": {"auth_token": "xyz"}
  }
}

Response:
{
  "status": "passed",
  "duration_ms": 45,
  "extracted": {
    "response.status": 200,
    "response.body": {...}
  }
}
```

---

## 5. Configuration

### 5.1 Configuration File

`exo-bdd.yaml` (or `.json`, `.toml`):

```yaml
# exo-bdd.yaml
version: "1"

# Test file locations
features:
  paths:
    - ./features
    - ./specs
  pattern: "**/*.feature"

# System definitions
systems:
  api:
    adapter: http
    config:
      base_url: ${API_URL:-http://localhost:3000}
      timeout: 30000
      headers:
        Accept: application/json
      auth:
        type: bearer
        token_var: AUTH_TOKEN

  database:
    adapter: postgres
    config:
      connection_string: ${DATABASE_URL}
      
  web:
    adapter: playwright
    config:
      browser: chromium
      headless: ${CI:-false}
      base_url: http://localhost:3000
      viewport:
        width: 1280
        height: 720

  cli:
    adapter: shell
    config:
      working_dir: ./
      env:
        NODE_ENV: test

  security:
    adapter: zap
    config:
      api_url: http://localhost:8080
      api_key: ${ZAP_API_KEY}

# Adapter configuration
adapters:
  # Remote adapter example
  custom:
    type: remote
    url: http://localhost:9000/adapter

# Execution settings
execution:
  parallel: 4
  fail_fast: false
  retry:
    count: 2
    delay: 1000
  timeout:
    step: 30000
    scenario: 300000

# Hooks
hooks:
  before_all: ./hooks/setup.sh
  after_all: ./hooks/teardown.sh

# Reporting
reports:
  - type: console
    verbosity: normal
  - type: junit
    output: ./reports/junit.xml
  - type: html
    output: ./reports/index.html
  - type: json
    output: ./reports/results.json

# Variable sources
variables:
  files:
    - ./fixtures/test-data.yaml
  env_prefix: EXO_BDD_

# Tags
tags:
  exclude:
    - "@wip"
    - "@skip"
```

### 5.2 Environment-Specific Overrides

```yaml
# exo-bdd.ci.yaml
extends: exo-bdd.yaml

systems:
  web:
    config:
      headless: true
      
execution:
  parallel: 8
```

---

## 6. Built-in Adapters

### 6.1 HTTP Adapter

Handles REST API testing.

**Step Definitions:**

```gherkin
# Request building
Given I set header {string} to {string}
Given I set query param {string} to {string}
Given I set basic auth with user {string} and password {string}
Given I set bearer token to {string}
Given I attach file {string} as {string}

# Requests
When I GET {string}
When I POST to {string}
When I POST to {string} with body:
When I PUT to {string} with body:
When I PATCH to {string} with body:
When I DELETE {string}
When I send a {word} request to {string}
When I send a {word} request to {string} with body:

# Response assertions
Then the response status should be {int}
Then the response status should be between {int} and {int}
Then the response header {string} should equal {string}
Then the response header {string} should match {string}
Then the response body should equal:
Then the response body should contain {string}
Then the response body should match schema {string}
Then the response body path {string} should equal {string}
Then the response body path {string} should equal {int}
Then the response body path {string} should match {string}
Then the response body path {string} should exist
Then the response body path {string} should not exist
Then the response body path {string} should have {int} items
Then the response time should be less than {int}ms

# Variable extraction
And I store {string} as {string}
And I store response header {string} as {string}
```

**Session State:**
- Current headers
- Current query params
- Last response (status, headers, body, timing)
- Cookies (persisted across requests)

### 6.2 Shell/CLI Adapter

Handles command-line application testing.

**Step Definitions:**

```gherkin
# Setup
Given I set environment variable {string} to {string}
Given I set working directory to {string}
Given I clear environment variable {string}

# Execution
When I run command {string}
When I run command {string} with timeout {int}s
When I run command {string} with stdin:
When I run {string} interactively
And I send {string} to stdin
And I send line {string} to stdin
And I press {word}  # enter, ctrl-c, etc.

# Assertions
Then the exit code should be {int}
Then the exit code should not be {int}
Then stdout should contain {string}
Then stdout should match {string}
Then stdout should equal:
Then stderr should contain {string}
Then stderr should be empty
Then stdout line {int} should equal {string}
Then the output should match snapshot {string}

# Variable extraction
And I store stdout as {string}
And I store stdout line {int} as {string}
And I store stdout matching {string} as {string}
```

**Session State:**
- Environment variables
- Working directory
- Last command result (stdout, stderr, exit code, duration)

### 6.3 Browser Adapter

Handles Web UI testing (Playwright/Selenium compatible).

**Step Definitions:**

```gherkin
# Navigation
Given I navigate to {string}
Given I am on the {string} page
When I navigate to {string}
When I reload the page
When I go back
When I go forward

# Interactions
When I click {string}  # text, selector, or role
When I click the {string} button
When I click the {string} link
When I double-click {string}
When I right-click {string}
When I hover over {string}
When I fill {string} with {string}
When I clear {string}
When I select {string} from {string}
When I check {string}
When I uncheck {string}
When I press {string}  # keyboard key
When I type {string}
When I upload {string} to {string}
When I drag {string} to {string}
When I scroll to {string}

# Waiting
When I wait for {string} to be visible
When I wait for {string} to be hidden
When I wait for {int} seconds
When I wait for network idle

# Frames & Windows
When I switch to frame {string}
When I switch to main frame
When I switch to window {string}
When I close current window

# Assertions
Then I should see {string}
Then I should not see {string}
Then the page title should be {string}
Then the page title should contain {string}
Then the URL should be {string}
Then the URL should contain {string}
Then {string} should be visible
Then {string} should be hidden
Then {string} should be enabled
Then {string} should be disabled
Then {string} should have text {string}
Then {string} should have value {string}
Then {string} should have attribute {string} with value {string}
Then {string} should have class {string}
Then {string} should be checked
Then {string} should not be checked
Then there should be {int} {string} elements
Then the page should match screenshot {string}
Then {string} should match screenshot {string}

# Variable extraction
And I store the text of {string} as {string}
And I store the value of {string} as {string}
And I store the URL as {string}
```

**Session State:**
- Browser instance
- Page/tab references
- Cookies
- Local storage state

### 6.4 Database Adapter

Handles direct database verification.

**Step Definitions:**

```gherkin
# Setup
Given I connect to database {string}
Given I start a transaction
Given I rollback the transaction
Given I commit the transaction

# Data setup
Given the table {string} is empty
Given the table {string} has data:
Given I insert into {string}:
Given I execute SQL:
Given I load fixture {string}

# Assertions
Then the table {string} should have {int} rows
Then the table {string} should have {int} rows where {string}
Then the table {string} should contain:
Then the row in {string} where {string} should have:
Then the query {string} should return {int} rows
Then the query {string} should return:
Then the table {string} should be empty

# Variable extraction
And I store the result of {string} as {string}
And I store column {string} from {string} where {string} as {string}
```

**Supported Databases:**
- PostgreSQL
- MySQL/MariaDB
- SQLite
- MongoDB
- Redis

### 6.5 Security Adapter

Handles security/penetration testing.

**Step Definitions:**

```gherkin
# Scanning
When I run a baseline scan on {string}
When I run an active scan on {string}
When I scan {string} for vulnerabilities
When I spider {string}
When I run OWASP ZAP scan on {string}

# Specific vulnerability tests
When I test {string} for SQL injection
When I test {string} for XSS
When I test {string} for CSRF
When I test authentication endpoints for brute force
When I test for insecure headers on {string}
When I test SSL/TLS configuration on {string}

# Assertions
Then no critical vulnerabilities should be found
Then no high vulnerabilities should be found  
Then vulnerabilities should not exceed severity {string}
Then the endpoint should have security headers:
Then the Content-Security-Policy should include {string}
Then SSL certificate should be valid
Then no sensitive data should be exposed in {string}

# Reporting
And I save vulnerability report to {string}
```

**Integration Options:**
- OWASP ZAP
- Nuclei
- Custom scripts

---

## 7. Assertions

### 7.1 Assertion Types

| Type | Operators | Example |
|------|-----------|---------|
| Equality | `equal`, `not equal` | `should equal "foo"` |
| Comparison | `greater than`, `less than`, `between` | `should be greater than 5` |
| Pattern | `match`, `contain` | `should match "^user-\d+"` |
| Type | `be a`, `be an` | `should be an array` |
| Existence | `exist`, `be null`, `be empty` | `should exist` |
| Collection | `have length`, `include`, `all match` | `should have length 3` |
| Schema | `match schema` | `should match schema "user.json"` |

### 7.2 JSONPath Support

All adapters support JSONPath for extracting and asserting on nested data:

```gherkin
Then the response body path "$.users[0].name" should equal "John"
Then the response body path "$.users[*].email" should all match ".*@example.com"
Then the response body path "$.meta.pagination.total" should be greater than 0
```

### 7.3 Schema Validation

JSON Schema validation for API responses:

```gherkin
Then the response body should match schema "schemas/user.json"
```

Schema files location: `./schemas/` (configurable)

---

## 8. Hooks & Lifecycle

### 8.1 Lifecycle Events

```
BeforeAll
  BeforeFeature
    BeforeScenario
      BeforeStep
        Step Execution
      AfterStep
    AfterScenario
  AfterFeature
AfterAll
```

### 8.2 Hook Definition

Hooks can be defined as:

1. **Shell scripts** (configured in YAML)
2. **Feature files** (special `@hook` tag)
3. **Adapter hooks** (per-adapter setup/teardown)

```yaml
# exo-bdd.yaml
hooks:
  before_all:
    - ./scripts/start-services.sh
    - ./scripts/seed-database.sh
  after_all:
    - ./scripts/stop-services.sh
  before_scenario:
    tags: ["@database"]
    script: ./scripts/reset-db.sh
```

```gherkin
# hooks.feature
@hook:before_scenario @api
Feature: API Setup Hook
  Scenario: Authenticate before API tests
    When I POST to "/auth/login" with body:
      """json
      {"email": "test@example.com", "password": "test123"}
      """
    And I store "response.body.token" as "auth_token"
```

### 8.3 Tagged Hooks

Hooks can target specific tags:

```yaml
hooks:
  before_scenario:
    - tags: ["@authenticated"]
      feature: ./hooks/login.feature
    - tags: ["@admin"]
      feature: ./hooks/admin-login.feature
```

---

## 9. Variables & State

### 9.1 Variable Scopes

| Scope | Lifetime | Access |
|-------|----------|--------|
| `global` | Entire test run | `${global.var}` |
| `feature` | Single feature file | `${feature.var}` |
| `scenario` | Single scenario | `${var}` or `${scenario.var}` |
| `env` | Environment variables | `${env.VAR_NAME}` |

### 9.2 Variable Interpolation

Variables can be used in any step argument:

```gherkin
Given I set header "Authorization" to "Bearer ${auth_token}"
When I GET "/users/${user_id}"
Then the response body path "$.email" should equal "${expected_email}"
```

### 9.3 Built-in Variables

| Variable | Description |
|----------|-------------|
| `${timestamp}` | Current Unix timestamp |
| `${iso_date}` | Current ISO 8601 date |
| `${uuid}` | Generated UUID v4 |
| `${random.int(min,max)}` | Random integer |
| `${random.string(len)}` | Random alphanumeric string |
| `${random.email}` | Random email address |
| `${faker.*}` | Faker.js generators |

### 9.4 Variable Files

Load variables from external files:

```yaml
# fixtures/test-data.yaml
users:
  admin:
    email: admin@example.com
    password: admin123
  regular:
    email: user@example.com
    password: user123

api:
  version: v2
```

Usage:
```gherkin
When I POST to "/auth/login" with body:
  """json
  {
    "email": "${users.admin.email}",
    "password": "${users.admin.password}"
  }
  """
```

---

## 10. Reporting

### 10.1 Report Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| `console` | Terminal output with colors | Local development |
| `json` | Machine-readable results | CI integration |
| `junit` | JUnit XML format | CI/CD pipelines |
| `html` | Interactive HTML report | Sharing with stakeholders |
| `allure` | Allure framework format | Advanced reporting |
| `markdown` | Markdown summary | PR comments |

### 10.2 Console Output

```
Feature: User Authentication

  Scenario: Successful login                    ✓ (245ms)
    ✓ Given the "api" system is available       (12ms)
    ✓ Given I set header "Content-Type"...      (1ms)
    ✓ When I POST to "/auth/login"              (189ms)
    ✓ Then the response status should be 200    (2ms)
    ✓ And the response body should match...     (41ms)

  Scenario: Invalid credentials                 ✓ (156ms)
    ...

────────────────────────────────────────────────────────
Features: 5 passed, 0 failed
Scenarios: 23 passed, 1 failed, 2 skipped
Steps: 142 passed, 1 failed, 8 skipped
Duration: 12.4s
```

### 10.3 Report Attachments

Adapters can attach artifacts to reports:

- Screenshots (Browser adapter)
- Response bodies (HTTP adapter)
- Command output (CLI adapter)
- Vulnerability reports (Security adapter)

---

## 11. CLI Interface

### 11.1 Commands

```bash
# Run all tests
exo-bdd run

# Run specific feature files
exo-bdd run features/auth.feature features/users.feature

# Run by tags
exo-bdd run --tags "@smoke and not @slow"
exo-bdd run --tags "@api or @cli"

# Run specific scenario by name
exo-bdd run --name "Successful login"

# Parallel execution
exo-bdd run --parallel 4

# Specify config file
exo-bdd run --config exo-bdd.ci.yaml

# Dry run (validate without executing)
exo-bdd run --dry-run

# Generate step definition stubs
exo-bdd steps --undefined

# List available steps
exo-bdd steps --list
exo-bdd steps --list --adapter http

# Validate configuration
exo-bdd validate

# Initialize new project
exo-bdd init

# Health check all systems
exo-bdd health

# Generate report from previous run
exo-bdd report --input results.json --format html --output report.html
```

### 11.2 Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All scenarios passed |
| 1 | One or more scenarios failed |
| 2 | Configuration error |
| 3 | Missing step definitions |
| 4 | System connection error |

### 11.3 Environment Variables

| Variable | Description |
|----------|-------------|
| `EXO_BDD_CONFIG` | Path to config file |
| `EXO_BDD_TAGS` | Default tag filter |
| `EXO_BDD_PARALLEL` | Parallel execution count |
| `EXO_BDD_NO_COLOR` | Disable colored output |
| `EXO_BDD_DEBUG` | Enable debug logging |

---

## 12. Extension Points

### 12.1 Custom Adapters

Create a custom adapter package:

```
my-adapter/
├── package.json        # name: "exo-bdd-adapter-myservice"
├── index.js            # exports adapter interface
├── steps/              # step definition files
│   └── my-steps.js
└── README.md
```

```javascript
// index.js
module.exports = {
  name: 'myservice',
  version: '1.0.0',
  protocols: ['myproto'],
  
  async initialize(config) {
    // Setup adapter
  },
  
  async createSession(world) {
    return new MySession(world);
  },
  
  getStepDefinitions() {
    return [
      {
        pattern: /^I connect to myservice "([^"]*)"$/,
        type: 'Given',
        async execute(session, [serviceName]) {
          await session.connect(serviceName);
          return { status: 'passed', duration_ms: 100 };
        }
      }
    ];
  }
};
```

### 12.2 Custom Reporters

```javascript
// my-reporter.js
module.exports = {
  name: 'slack',
  
  onRunStart(run) {
    // Called when test run begins
  },
  
  onScenarioEnd(scenario, result) {
    // Called after each scenario
  },
  
  onRunEnd(summary) {
    // Send summary to Slack
    sendToSlack(formatSummary(summary));
  }
};
```

### 12.3 Custom Assertions

```javascript
// my-assertions.js
module.exports = {
  'be a valid email': (actual) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      pass: emailRegex.test(actual),
      message: `Expected "${actual}" to be a valid email`
    };
  },
  
  'be within range': (actual, [min, max]) => {
    return {
      pass: actual >= min && actual <= max,
      message: `Expected ${actual} to be between ${min} and ${max}`
    };
  }
};
```

### 12.4 Step Definition Transforms

Transform step arguments before they reach the adapter:

```yaml
transforms:
  - pattern: "today"
    replace: "${iso_date}"
  - pattern: "(\\d+) days? ago"
    function: ./transforms/date-offset.js
```

---

## Appendix A: Example Project Structure

```
my-project/
├── exo-bdd.yaml
├── exo-bdd.ci.yaml
├── features/
│   ├── api/
│   │   ├── auth.feature
│   │   ├── users.feature
│   │   └── products.feature
│   ├── web/
│   │   ├── login.feature
│   │   └── checkout.feature
│   ├── cli/
│   │   └── admin-commands.feature
│   └── security/
│       └── owasp-top-10.feature
├── schemas/
│   ├── user.json
│   └── product.json
├── fixtures/
│   ├── test-data.yaml
│   └── sql/
│       └── seed.sql
├── hooks/
│   ├── setup.sh
│   ├── teardown.sh
│   └── login.feature
├── adapters/
│   └── custom-adapter/
├── reports/
└── screenshots/
```

---

## Appendix B: Gherkin Quick Reference

```gherkin
# Tags (for filtering and hooks)
@tag1 @tag2

# Feature declaration
Feature: Feature name
  Optional description
  spanning multiple lines

  # Shared setup for all scenarios
  Background:
    Given some precondition

  # Basic scenario
  Scenario: Scenario name
    Given a precondition
    When an action occurs
    Then an outcome is expected
    And another outcome
    But not this outcome

  # Parameterized scenario
  Scenario Outline: Parameterized scenario
    Given I have <count> items
    When I add <more> items
    Then I should have <total> items

    Examples:
      | count | more | total |
      | 5     | 3    | 8     |
      | 0     | 1    | 1     |

  # Doc strings (multi-line text)
  Scenario: With doc string
    When I send:
      """json
      {"key": "value"}
      """

  # Data tables
  Scenario: With data table
    Given these users exist:
      | name  | email           |
      | John  | john@email.com  |
      | Jane  | jane@email.com  |
```

---

## Appendix C: Comparison with Existing Tools

| Feature | Exo BDD | Cucumber | Karate | Postman |
|---------|------------|----------|--------|---------|
| Language agnostic | Yes | Partial | No (JVM) | No |
| External testing only | Yes | No | Yes | Yes |
| Multi-protocol | Yes | Via code | HTTP only | HTTP only |
| Browser testing | Built-in | Via code | Limited | No |
| Security testing | Built-in | No | No | No |
| CLI testing | Built-in | Via code | No | No |
| Database testing | Built-in | Via code | Limited | No |
| Gherkin syntax | Yes | Yes | Modified | No |
| Remote adapters | Yes | No | No | No |

---

## Appendix D: Security Considerations

1. **Credential Management**: Never store credentials in feature files. Use environment variables or secure vaults.

2. **Network Isolation**: Run tests in isolated networks when testing security vulnerabilities.

3. **Database Safety**: Use transactions and rollback in database adapters to prevent test pollution.

4. **Rate Limiting**: Respect rate limits; configure delays between requests when needed.

5. **Output Sanitization**: Reports should sanitize sensitive data (tokens, passwords, PII).

---

*This specification is a living document. Contributions and feedback welcome.*
