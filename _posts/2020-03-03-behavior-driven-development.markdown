---
layout: post
title:  Behavior Driven Development
date:   2020-03-03 03:00:00 -0500
excerpt: GIVEN testing framework only works with python2, WHEN python2 is going to be deprecated, THEN use Behave for python3
tags: python
---
People joke about coding in Python because it basically reads like English. Given its syntactical simplicity and ability to abstract details away from the programmer, it's a popular beginner language and great for scripting.

What if Python just isn't English enough, though? There's still computer science-y concepts that are tough to pick up without coding experience.

Enter Behave, an even-more-English python testing framework.

## Behave
[Behave](https://behave.readthedocs.io/en/latest/) is marketed as a collaborative tool between software developers and non-technical or business people. It's a framework for Python that reads in a syntax called Gherkin, using keywords like `FEATURE`, `SCENARIO`, and `GIVEN`/`WHEN`/`THEN`.

I'll give an overused and simple example:
```powershell
# withdraw.feature
Feature: User withdraws cash from ATM

Scenario: Account has enough money
    Given the account balance is $100
    When the user withdraws $40
    Then the account balance should be $60
```

* `GIVEN` steps set up the context of what you're trying to test. In the example feature above, we put the system in a specific state before we touch or modify anything.
* `WHEN` steps describe the action a user takes in that specific scenario.
* `THEN` steps examine the state of the system after the action.

Before we start defining steps, we should define the dependencies. We need some kind of simple `Account` fixture, which can be easily drafted as follows:
```python
# steps/account.py
class Account:
    def __init__(self, amt=0):
        self.balance = amt

    def withdraw(self, amt):
        self.balance -= amt
```
Now we have to define the steps in a python file. We do this using the provided `@given`, `@when`, and `@then` decorators. Behave also shares a global `context` where you can store your information across steps. In this case, we define the `account` attribute to be the an instance of an `Account` fixture.
```python
@given('the account balance is $100')
def step_impl(context):
    context.account = Account(100)
```
There is a nice feature where you don't have to define every balance in existence, thankfully. We can instead use some pattern matching. `amt` is the variable name that we pass into the function. `:d` is to cast the it into a decimal number. If `:d` is left out, the parameter will be passed in as a string. 

```python
@given('the account balance is ${amt:d}')
def step_impl(context, amt):
    context.account = Account(amt)
```

We can put this all together in a few steps
```python
# steps/step_withdraw.py
from behave import given, when, then
from account import Account

@given('the account balance is ${amt:d}')
def step_impl(context, amt):
    assert amt > 0
    context.account = Account(amt)

@when('the user withdraws ${amt:d}')
def step_impl(context, amt):
    assert amt > 0 and context.account.balance >= amt
    context.account.withdraw(amt)

@then('the account balance should be ${amt:d}')
def step_impl(context, amt):
    assert context.account.balance == amt
```
The folder structure looks like this:
```
project/
|
|-- withdraw.feature
|
|-- steps/
|   |-- step_withdraw.py
|   |-- account.py 
```

To invoke the behave test for all features, we can run the command `behave features/`.

```shell
taylorhe@Taylor-PC:/mnt/c/Users/.../behave$ behave features/
Feature: User withdraws cash from ATM # features/tut.feature:1

  Scenario: Account has enough money       # features/tut.feature:2
    Given the account balance is $100      # features/steps/step_tut.py:4 0.000s
    When the user withdraws $40            # features/steps/step_tut.py:9 0.000s
    Then the account balance should be $60 # features/steps/step_tut.py:14 0.000s

1 feature passed, 0 failed, 0 skipped
1 scenario passed, 0 failed, 0 skipped
3 steps passed, 0 failed, 0 skipped, 0 undefined
Took 0m0.001s
```

So that's the basic introduction to Behave. More to be added later.
