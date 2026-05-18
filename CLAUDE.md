# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Projeto

## Projeto

Aplicação de gerenciamento de corridas para taxistas e motoristas de aplicativo, desenvolvida com a metodologia **SDD (Software Design Documents)** com agentes, comandos e skills localizados em `.claude/`.

## Regras de Implementação

As regras estão em `docs/consitution.md`;

## Commands

Informações relacionadas à comandos diversos (rodas, construir, testar, etc) estão em `docs/commands.md`

## Stack

As informações relacionadas à Stack de Tecnologias está em `docs/stack.md`

## Architecture

Informações relacionadas à arquitetura do sistema estão em `docs/architecture.md`

## Important: read docs before coding

Next.js 16 and Tailwind 4 have breaking changes vs prior versions. Before writing any code that touches routing, data fetching, or styling primitives, read the relevant guide:

- Next.js: `node_modules/next/dist/docs/`
- Tailwind: `node_modules/tailwindcss/` (check changelog/migration guide)

ESLint uses the flat config format (ESLint 9) — `eslint.config.mjs`, not `.eslintrc`.
