# Munu-løpet — integrasjon Bong × Munu

> Eget partner-/integrasjonsløp. Holdes utenfor kunde-CRM (CRM-en er satt opp for hendelser knyttet til våre kunder).
> Opprettet: 2026-06-16

## Mål
Bygge integrasjon rett mot Munus kassesystem: når en **Bong aktiveres** i vårt system, overføres det automatisk til Munu og vises i kundens kasse (at det ble brukt en Bong på X drikke). I tillegg sende historiske bongdata slik at det kan kombineres med øvrige salgstall.
Sannsynligvis enveis synk (Bong → Munu); muligens toveis.

## Om Munu
- **MUNU AS** — org.nr 925 095 435, Stavanger. Morselskap: Munu Holding AS (825 541 632).
- Skybasert hospitality-plattform: POS/kassesystem, mobil bestilling, bordbooking, betaling, KDS, lager, analyse.
- Etablert i Stavanger 2016. Marked: Norden (NO, SE, DK, FI).
- Kontorer: Stavanger (HK, Olav Vs gate 11, 4005), Oslo (Sannergata 2, 0557), Trondheim (Nedre Ila 27, 7018), Kista (SE), Polen.
- **Teknisk:** Åpne REST-baserte API-er, utviklerdokumentasjon, partnerprogram («Munu Connect»). Integrerer i dag mot bl.a. Tripletex, PowerOffice, Mews.

## Kontaktkanaler
- Salg: sales@munu.cloud
- Support/generelt: support@munu.cloud · +47 4000 3852 (hverdager 08–17)
- Presse: pr@munu.cloud

## Nøkkelpersoner
| Navn | Rolle | Relevans | LinkedIn |
|------|-------|----------|----------|
| Håkon Sverre Rønning | Chief Business Development Officer | **Primær** — eier partnerskap/integrasjoner | https://no.linkedin.com/in/h%C3%A5kon-sverre-r%C3%B8nning-96ab5281 |
| Bjørn A. Laukli | CTO (Oslo) | Teknisk beslutningstaker — API/arkitektur | https://no.linkedin.com/in/blaukli |
| Kristian Reinertsen | Product Manager (Stavanger) | Produkt/roadmap | https://www.linkedin.com/in/kristian-reinertsen-a675253a/ |
| Tor Erik Skårdal | Product Manager | Produkt, teknisk nær | https://no.linkedin.com/in/tor-erik-skardal |
| David Gregory Ingram | Daglig leder / CEO | Øverste beslutningstaker (eskalering) | — |
| Svein Ole Bowitz | Styreleder | Eier/styre | — |
| Ingrid Opedal | Styremedlem | Styre | — |

## Strategi (hold i bakhodet — ikke i mailen)
- **Primærmålgruppe: konferansehoteller.** Munu fronter selv hotell som bransje (munu.cloud/no/hoteller).
- **Felles kunder (sterkt kort):** Strawberry-konsernet bruker Munu bredt. Bong-kunder i Strawberry: **Quality Hotel Sarpsborg** og **Hotel Maritim Haugesund** — begge har eksplisitt bedt om Munu-integrasjon. OK å navngi skriftlig.
- **Mekanikk:** Bonger er IKKE forhåndsbetalt — faktureres etter arrangement basert på faktisk bruk, i dag telt manuelt (papir). Bong aktiveres ved at gjesten drar fingeren over skjermen (à la TooGoodToGo). Bong eier koblingen bong → arrangement/kunde (settes ved opprettelse av arrangement). → Ren **enveis** (Bong → Munu) i fase 1.
- **Oppkjøp:** Vi ser på Munu som mulig oppkjøper om 1–2 år. Posisjonér Bong som en naturlig forlengelse av Munus produkt («fullføring, ikke mangel»). Nevnes ikke i mailen.

## Verdiforslag for Munu (lede med disse — ramme: «Munu leverer et enda bedre produkt til Strawberry»)
1. **Fjerner manuell opptelling + korrekt fakturering.** Bonger telles manuelt etter arrangement før fakturering — tidkrevende/feilutsatt. Integrasjonen registrerer hver aktiverte bong automatisk i Munu → riktig etterfakturering uten manuelt arbeid. Speiler Munus eget løfte om «automatiske og nøyaktige arbeidsflyter for romfakturering».
2. **Komplette data på tvers av alle arrangementer.** Munu lover allerede sanntidsinnsikt på tvers av hotellet; Bong utvider den til arrangements-/drikkeforbruk (i dag manuelt) → Strawberry ser hva som selger best og er mest lønnsomt. Vinkling: **fullføring av løftet de selv selger, ikke en mangel.**
3. **Vekst begge veier.** Bong møter restauranter/barer/lokaler på andre kassesystemer → kan anbefale Munu + Bong-integrasjon (mer komplett system). Munu får ekstra salgspoeng inn mot egne arrangementskunder. Dempet formulering om teknisk løft: «overkommelig gitt deres eksisterende API-er».

## Tekniske spørsmål å avklare
- Tilgang til API-dokumentasjon + sandbox-miljø
- Autentisering (OAuth?)
- Relevante endepunkter: salg, ordre, produkter/varelinjer, kunder
- Webhooks for sanntidsoverføring av aktivering
- Hvordan en «Bong brukt på X drikke» best representeres på en salgslinje
- Formelt partnerprogram / kommersielle vilkår («Munu Connect»)

## Status / logg
- **2026-06-16** — Kartlagt selskap + nøkkelpersoner. Sendt LinkedIn-kontaktforespørsler til Bjørn, Håkon, Kristian og Tor. Grillet budskapet og landet endelige utkast (under). Spurt Hotel Maritim Haugesund om varm intro/kontaktinfo inn til Munu. **E-post sendt til sales@munu.cloud.** Venter på LinkedIn-aksept og svar fra Haugesund.

## Neste steg
- [x] Send e-post til sales@munu.cloud (CTA: be om henvisning til rett person)
- [ ] Avventer svar fra sales@ / henvisning videre
- [ ] Avventer LinkedIn-aksept — send DM til Håkon når han connecter (varm oppfølging)
- [ ] Følg opp varm intro via Hotel Maritim Haugesund
- [ ] Purr vennlig på e-post etter ~5 virkedager (rundt 23.06) ved stillhet
- [ ] Skaff API-dokumentasjon og forbered teknisk prat

## Endelige utkast (2026-06-16)

### E-post → generell adresse (sales@munu.cloud / post@), be om henvisning videre
**Emne:** Bong × Munu: digitale bonger for konferansehotell, etterspurt av deres hotellkunder

Hei,

Vi tar kontakt fordi to av deres kunder, Quality Hotel Sarpsborg og Hotel Maritim Haugesund, bruker Bong i dag og har etterspurt en integrasjon mot Munu.

Bong leverer digitale drikkebonger for konferansehoteller. I stedet for papirbonger som telles manuelt etter arrangementet, aktiverer gjesten bongen selv, og hver bong knyttes automatisk til riktig arrangement og kunde.

**Hva vi ønsker å bygge:** En integrasjon mot kassesystemet deres der hver aktiverte bong registreres automatisk i Munu, knyttet til riktig arrangement. Vi ser for oss enveis synk i første omgang (fra Bong til Munu), men er åpne for toveis dersom dere mener det er mest hensiktsmessig.

**Hvorfor det styrker Munu, særlig inn mot hotellene:**

1. **Fjerner manuell opptelling og sikrer korrekt fakturering.** I dag telles papirbonger manuelt etter hvert arrangement før hotellet kan fakturere, noe som er tidkrevende og feilutsatt. Med integrasjonen registreres hver aktiverte bong automatisk i Munu, slik at etterfaktureringen blir riktig uten manuelt arbeid. Det er samme type automatiske og nøyaktige arbeidsflyt dere allerede leverer for romfakturering, nå også for bonger.

2. **Komplette data på tvers av alle arrangementer.** Dere leverer allerede sanntidsinnsikt på tvers av hotellet, og med digitale bonger utvider vi den innsikten til også å dekke forbruket på arrangementer og drikke, et område som i dag løses manuelt. Hotellene får et komplett bilde av hva som selger best og er mest lønnsomt på arrangementer.

3. **Vekst begge veier.** Vi møter jevnlig restauranter, barer og andre lokaler som bruker ulike kassesystemer, og med en ferdig integrasjon kan vi anbefale Munu til dem som et mer komplett system. Samtidig gir det dere et ekstra salgspoeng inn mot egne kunder som jobber med arrangementer.

Vi vil gjerne forstå hvordan vi best kobler oss på. Kan den som leser dette sende oss videre til rett person for partnerskap og integrasjon? Jeg tar gjerne en uforpliktende introprat med rett person for å se om dette kan bli et godt samarbeid.

Mvh
[Navn]
Bong, [telefon] · [e-post] · [nettside]

### LinkedIn-DM → Håkon (når han aksepterer)
Hei Håkon! Takk for at du tok kontaktforespørselen. Bong leverer digitale drikkebonger for konferansehoteller, der gjesten aktiverer bongen selv og hver bong knyttes automatisk til riktig arrangement.

To av deres kunder, Quality Hotel Sarpsborg og Hotel Maritim Haugesund, bruker Bong i dag og har etterspurt en integrasjon mot Munu. Da slipper hotellene å telle papirbonger manuelt for å fakturere etter arrangementet, og dere får komplette data på drikkeforbruk inn i sanntidsinnsikten dere allerede leverer.

Jeg tar gjerne en uforpliktende introprat for å se om dette kan bli et godt samarbeid. Har du 20 til 30 minutter de neste par ukene?
