---
sidebar_position: 1
---

# Introduction

[Bracket](https://github.com/evroon/bracket) is a tournament system meant to be easy to use. Bracket
is written in async Python (with [FastAPI](https://fastapi.tiangolo.com)) and
[Next.js](https://nextjs.org/) as frontend using the [Mantine](https://mantine.dev/) library.

## Overview of features

It has the following features:

- Supports **single elimination, round-robin and swiss** formats.
- **Build your tournament structure** with multiple stages that can have multiple groups/brackets in
  them.
- **Drag-and-drop matches** to different courts or reschedule them to another start time.
- Various **dashboard pages** are available that can be presented to the public, customized with a
  logo.
- Create/update **teams**, and add players to **teams**.
- Create **multiple clubs**, with **multiple tournaments** per club.
- **Swiss tournaments** can be handled dynamically, with automatic scheduling of matches.

## Why does this exist?

There are plenty of tournament systems to be found online. So why does Bracket exist?

**Firstly**, there are **no complete open-source tournament systems to be found** [on
github](https://github.com/search?q=tournament%20system&type=repositories). Let me know if you find
one, I will list it here as alternative to Bracket. Furthermore, the closed-source tournament
systems that can be found online are typically payware, and **quite expensive**.

**Secondly**, there is a **lack of tournament systems that support Swiss tournaments**. There are a
few that exist, but they're typically quite ancient projects. Furthermore, AFAIK the Swiss
tournament systems that exist usually only support Swiss, no other types of tournament elements
(round-robin, elimination etc.). That is quite a limitation when you want to host a tournament that
starts with Swiss and determines a winner based on a knockoff (elimination) stage.

**Finally**, I developed this project to learn more about Next.js and apply my Python (e.g. FastAPI)
experience to a project with a real purpose.

## Quickstart

To get started, follow the steps described in [quickstart](running-bracket/quickstart.md)
