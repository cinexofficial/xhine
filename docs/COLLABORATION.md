# Two-person workflow

## First setup

- Put this project in one private GitHub repository.
- Invite the other developer using their own GitHub account.
- Both clone the same repository, install the locked dependencies, run checks, and open the app locally.
- Create a project board with To do, In progress, Review, and Done.
- Choose a weekly 30-minute demonstration call. Post a brief update after completing a task or finding a blocker.

## Starter tasks

| Task                                       | Initial owner | Done when                                                                              |
| ------------------------------------------ | ------------- | -------------------------------------------------------------------------------------- |
| Run the project on both computers          | Together      | Both developers can install, start, and build from the README.                         |
| Walk through the complete assignment story | Together      | Teacher posting, student completion, refresh, and reopening work on both local copies. |
| Review student navigation and summaries    | Developer A   | Every count and destination matches the current student's data.                        |
| Review teacher posting forms               | Developer B   | Both sections work; invalid forms explain the correction.                              |
| Review shared domain/persistence changes   | Developer A   | Types remain consistent and boundary tests pass.                                       |
| Phone and keyboard review                  | Developer B   | All core tasks work at narrow widths and without a mouse.                              |
| Collect early feedback                     | Together      | A few students and a teacher try the tasks; observations are recorded.                 |

Reassign explicitly when needed. “Developer A/B” are placeholders for you and your friend, not extra agents.

## Definition of done

A task has a visible outcome, passes the relevant checks, includes a screenshot/short recording for UI changes, is reviewed by the other person, and has updated documentation where behavior changed. Keep pull requests small. Don't merge code just because an AI says it works; run the scenario yourself.

## Review rhythm

Branch → implement one outcome → run checks → pull request → other person reviews → merge → both update main. Avoid simultaneous changes to shared models or styles without agreeing on ownership.

Suggested weekly call: 10 minutes of working demos, 10 minutes of observations/blockers, 10 minutes choosing the next small tasks. Match scope to 5–10 hours each per week.
