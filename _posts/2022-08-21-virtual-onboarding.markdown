---
layout: post
title:  Virtual Onboarding Sucks
date:   2022-8-21 03:00:00 -0500
excerpt: Why does onboarding suck?
tags:
---
Floop t<!-- he roon, then flip the gloop. No, not the borg - the gloop.
Afterward, just dice the tumpa and that should be it.

This isn't too much of a technical post as it is a rant. A lot of it stems from frustations in communication and just a different not-as-collaborative environment.


## Why does it suck?
The great resignation during the pandemic meant the start of new jobs for everyone. With so much talent leaving and joining, there must be some emphasis on onboarding and making people productive.

In a previous life, I was a mentor for 3 new hires, including an intern. And I found it really really hard to onboard people because I had to explain to new hires things that I didn't need for other experienced people. Every time was a new challenge, even if the documentation was getting better. I hope I didn't fail my mentees. I tried hard to make myself available and erred on the side of overexplaining not only technical portions, but also the big-picture of why we're trying to do this goal.

I've recently been on the flip side after switching jobs, and did not have the greatest experience. However, it was an incredible learning opportunity; I wish I had gone through this experience before mentoring people. 

I wish someone would sit down with me and help me through my first few code changes, but instead I was told things that were a bit too vague for me.

- "Terminate it early if there's an error"
- "Just install A"
- "Can you create X?"

While great for an experienced teammate, these vague phrases leave a lot of unknowns to a new joinee. While too much explanation might not be completely the solution, maybe mentors can at least give some direction.

- "If you find error type X, let's bubble up an error for the user." 
    - This clarifies in which situation to terminate and *how* to terminate the code, as there might be other ways - just return from the function? Throw an exception?
- "In this framework, we need this dependency to do X, but it cannot be resolved without installing A, which is a non-obvious dependency. You can read up on it if you search for Y."
    - I spent probably a few hours finding out what dependency A was, but was unable to see how they connected. I might be able to resolve the issue once, but I haven't learned for the future. My mentor had known it was not obvious, but I'm not sure why he decided to withold that information.
- "In this document, you can see that A, B, and C already exist and provide functionality for D. However, one of the services is being deprecated, so for this project, we need to create a replacement X. You can talk to Y on a sister team for specific info."
    - This will give a joinee much more context as to what they are doing, why they are doing it, and just overall clarity into the project.

Yeah, the revised ones are a bit hand-holdy. But if the mentor knows, why wouldn't they give more information rather than less? After the onboarding period, mentors can ween off this kind of talk when the joinee has more confidence and experience.

I also get that a lot of the issues onboarding have been much more pronounced for me because I am remote from my team. It's harder to find that team camaraderie, there's the extra typing friction of asking for help, and being unable to build relationships in the break areas and lunch rooms.

## A Conversation

Many times I have to follow up, which is frustrating for both me and my mentor. It usually goes like this (this is a fake conversation, but I've had similar ones):

1. Mentor: "Can you modify X in the service node to do Y?"
2. Me: "Sure", and I look up the term service node. I can't find any documentation on it. I keep looking for a while, reading through dense and very technical documentation, thinking that I've missed a piece. Finally, I give up - I'm convinced there's no such thing as a service node. I take my best guess and ask: 
3. Me: "What is a service node? Do you mean a composite node?"
4. Mentor: "Yes"
5. Me: "Which composite node specifically are you talking about?"
6. Mentor: "This one here: (links to node)"
7. Me: "Thanks, I see that there are 3 types of X. Which one do I have to change?"
8. ...

I feel like any new person would be confused with the initial information provided. Maybe if I had context of a project, or had been working on a piece for months, I would be able to guess/deduce certain things. For someone with little to no information, it feels like bad communication. I know as an engineer I must work through ambiguous problems, but there is a certain point where it's not my fault (right?).

I really wish I didn't have to do so much digging to clarify most times. I wish the first message read like "Hey, do you want to video chat real quick to go over project X?" so I can get more real-time questions, or even better, description through text: "Hey, we need to accomplish goal A. We already have these pieces, but still need to finish one of the pieces in this diagram here. We use this service call to fetch this kind of data to publish metadata downstream. In here, X must be changed to do Y instead because a team is updating their schema. In the bigger application cluster, there are 3 nodes, and we'll need to change this specific composite node, which we call the service node."


## More than Onboarding
Some people have no problems in their onboarding experiences, and that is great. However, a mentor is just another engineer, and he or she is not necessarily trained/educated properly to teach and help people. I feel like an emphasis on teaching will not only help an individual develop their career, but also create a better environment for newbies and experienced people new to a team or environment.

For the mentee, it also sets up their trajectory for success, which in turn helps the employee and the company.

I felt the opposite - It's been 9 months since I joined, and I still don't feel completely onboarded. A lot of times I feel overwhelmed and lost, and it impacts my motivation heavily. Maybe I just suck as an engineer, but this feeling hasn't changed since I started onboarding. I find myself having to clarify most things my mentor asks, and sounding like a newbie almost a year in. I want control over my career - and while maybe I can get a passing grade, I find it incredibly hard to set up a trajectory that exceeds expectations, where peers who have had more guidance are in a better spot.

For this, I could blame myself, that I am a poor engineer, and maybe this environment isn't cut out for me. But I know that I have thrived in environments before in two previous jobs, and all it took was a little formal/informal onboarding.

I could blame my mentor, but that would not be fair - he probably hasn't had any training and mentoring isn't part of his core job description (maybe a secondary goal). Communication is tough, but I have to work with many types of people, and there isn't one mode of communication that is "correct."

So I'll blame the company. To me, the company seems to have a performance system rewards heroes - those who create a big project and showcases a shiny piece of work. It doesn't feel like there's much emphasis on teamwork or mentorship - it's more of a checkmark that you are easy to work with, or if you have the title of mentor. Being good at onboarding doesn't give immediate results, and it eats up time that would otherwise be beneficial for one's own evaluation. Claiming that you've "improved onboarding time" in a performance evaluation sounds like filler and doesn't hold the same weight as other real technical work.

For a company, engineers are _expensive_, and even a few weeks shaved off over many new hires can save a company a lot of money. I'm no expert, if I had any advice, I'd say invest in onboarding and teaching. To support that, there was an article that [Sundar recently made an announcement](https://www.cnbc.com/2022/07/31/google-ceo-to-employees-productivity-and-focus-must-improve.html) telling the company that "Google’s productivity as a company isn’t where it needs to be given the head count it is". Given that so many Googlers are new, about a third joined during the pandemic (\~118k employees in 2019 to \~170k in 2022), it's no surprise (to a new googler) that we just haven't been as productive as we were in our previous jobs.

I would guess that many new googlers feel as I do. Who knows?


 -->