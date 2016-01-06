/*
  Small feed database, mainly based on information from DLG (1997), except values for NDF, which were taken from the French
  feed tables in Agabriel (2010).
  
  Values are expressed on dry matter basis (g kg-1 (DM)) except dry matter content (g kg-1 feed) and digestibilities (kg kg-1).

  REFERENCES
  
  DLG [German Agricultural Society]. 1997. DLG-Futterwerttabellen – Wiederkäuer [Feed Tables Ruminants]. University Hohenheim
  (ed.). 7th edition, DLG-Verlag, Frankfurt/Main, Germany.
  
  Agabriel, J. 2010. Alimentation des bovins, ovins et caprins. Besoins des animaux - Valeurs des aliments. Tables INRA
  2010. Editions Quae, France.

  LICENSE

  Copyright 2014 Jan Vaillant   <jan.vaillant@zalf.de>
  Copyright 2014 Lisa Baldinger <lisa.baldinger@boku.ac.at>

  Distributed under the MIT License. See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT

  Any publication for which this file or a derived work is used must include an a reference to:

  Vaillant, J. and Baldinger, L. 2016. 
  Application note: An open-source JavaScript library to simulate dairy cows and young stock,
  their growth, requirements and diets.
  Computers and Electronics in Agriculture, Volume 120, January 2016, Pages 7–9

*/

dairy.feed = dairy.feed || {};
dairy.feed.feeds = [
/*
  id []
  type []
  name []
  name_de []
  delta_F1 […]
  delta_C1 […]
  delta_FR1_QIL […]
  delta_S1_QIL […]
  delta_S2_QIL […]
  delta_H1_QIL […]
  delta_H2_QIL […]
  delta_FR1_QIB […]
  delta_S1_QIB […]
  delta_S2_QIB […]
  delta_H1_QIB […]
  delta_H2_QIB […]
  eco [0/1]
  DM [g kg-1 feed]
  ash [g kg-1 DM]
  OM [g kg-1 DM]
  OMD [kg kg-1]
  CP [g kg-1 DM]
  CPD [kg kg-1]
  EE [g kg-1 DM]
  EED [kg kg-1]
  CF [g kg-1 DM]
  CFD [kg kg-1]
  NFE [g kg-1 DM]
  NFED [kg kg-1]
  NDF [g kg-1 DM]
  starch [g kg-1 DM]
  sugar [g kg-1 DM]
*/
{
  id: 1,
  type: 'fresh',
  name: 'Grassland, 1st growth, leafy stage',
  name_de: 'Grünland 4+ Nutzungen grasreich, 1. Aufwuchs, Schossen',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 160,
  ash: 95,
  OM: 905,
  OMD: 0.84,
  CP: 235,
  CPD: 0.82,
  EE: 43,
  EED: 0.61,
  CF: 172,
  CFD: 0.81,
  NFE: 455,
  NFED: 0.88,
  NDF: 467,
  starch: 0,
  sugar: 45
},
{
  id: 2,
  type: 'fresh',
  name: 'Grassland, 1st growth, heading stage',
  name_de: 'Grünland, 4+ Nutzungen grasreich, 1. Aufwuchs, volles Rispenschieben',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 180,
  ash: 97,
  OM: 903,
  OMD: 0.77,
  CP: 207,
  CPD: 0.77,
  EE: 47,
  EED: 0.56,
  CF: 231,
  CFD: 0.78,
  NFE: 418,
  NFED: 0.78,
  NDF: 485,
  starch: 0,
  sugar: 35
},
{
  id: 3,
  type: 'fresh',
  name: 'Grassland, 1st growth, beginning of bloom',
  name_de: 'Grünland, 4+ Nutzungen, 1. Aufwuchs, Beginn Blüte',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 220,
  ash: 93,
  OM: 907,
  OMD: 0.75,
  CP: 187,
  CPD: 0.77,
  EE: 45,
  EED: 0.51,
  CF: 261,
  CFD: 0.75,
  NFE: 414,
  NFED: 0.76,
  NDF: 540,
  starch: 0,
  sugar: 25
},
{
  id: 4,
  type: 'fresh',
  name: 'Grassland, regrowth, <4 weeks',
  name_de: 'Grünland, 4+ Nutzungen, 2.  Aufwuchs < 4 Wochen',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 160,
  ash: 104,
  OM: 896,
  OMD: 0.75,
  CP: 235,
  CPD: 0.79,
  EE: 45,
  EED: 0.42,
  CF: 207,
  CFD: 0.74,
  NFE: 409,
  NFED: 0.76,
  NDF: 499,
  starch: 0,
  sugar: 71
},
{
  id: 5,
  type: 'fresh',
  name: 'Grassland, regrowth, 4-6 weeks',
  name_de: 'Grünland, 4+ Nutzungen, 2. Aufwuchs, 4-6 Wochen',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 180,
  ash: 103,
  OM: 897,
  OMD: 0.73,
  CP: 213,
  CPD: 0.77,
  EE: 45,
  EED: 0.47,
  CF: 229,
  CFD: 0.73,
  NFE: 410,
  NFED: 0.72,
  NDF: 485,
  starch: 0,
  sugar: 61
},
{
  id: 6,
  type: 'fresh',
  name: 'Grassland, regrowth, 7-9 weeks',
  name_de: 'Grünland, 4+ Nutzungen, 2. Aufwuchs, 7-9 Wochen',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 200,
  ash: 101,
  OM: 899,
  OMD: 0.71,
  CP: 190,
  CPD: 0.74,
  EE: 41,
  EED: 0.53,
  CF: 266,
  CFD: 0.72,
  NFE: 402,
  NFED: 0.71,
  NDF: 530,
  starch: 0,
  sugar: 50
},
{
  id: 7,
  type: 'fresh',
  name: 'Lucerne, 1st growth, budding stage',
  name_de: 'Luzerne, 1. Schnitt, in der Knospe',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 1,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 4.1,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 170,
  ash: 106,
  OM: 894,
  OMD: 0.7,
  CP: 219,
  CPD: 0.82,
  EE: 31,
  EED: 0.41,
  CF: 238,
  CFD: 0.55,
  NFE: 406,
  NFED: 0.75,
  NDF: 449,
  starch: 0,
  sugar: 15
},
{
  id: 8,
  type: 'fresh',
  name: 'Lucerne, 1st growth, beginning of bloom',
  name_de: 'Luzerne, 1. Schnitt, Beginn Blüte',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 1,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 4.1,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 200,
  ash: 106,
  OM: 894,
  OMD: 0.68,
  CP: 187,
  CPD: 0.8,
  EE: 29,
  EED: 0.4,
  CF: 286,
  CFD: 0.53,
  NFE: 392,
  NFED: 0.75,
  NDF: 487,
  starch: 0,
  sugar: 25
},
{
  id: 9,
  type: 'fresh',
  name: 'Lucerne, regrowth, budding stage',
  name_de: 'Luzerne, Folgeaufwuchs, in der Knospe',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 1,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 4.1,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 180,
  ash: 97,
  OM: 903,
  OMD: 0.7,
  CP: 214,
  CPD: 0.8,
  EE: 34,
  EED: 0.43,
  CF: 247,
  CFD: 0.51,
  NFE: 408,
  NFED: 0.78,
  NDF: 449,
  starch: 0,
  sugar: 40
},
{
  id: 10,
  type: 'fresh',
  name: 'Lucerne, regrowth, beginning of bloom',
  name_de: 'Luzerne, Folgeaufwuchs, Beginn Blüte',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 1,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 4.1,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 210,
  ash: 95,
  OM: 905,
  OMD: 0.67,
  CP: 204,
  CPD: 0.8,
  EE: 31,
  EED: 0.38,
  CF: 281,
  CFD: 0.49,
  NFE: 389,
  NFED: 0.73,
  NDF: 487,
  starch: 0,
  sugar: 35
},
{
  id: 11,
  type: 'fresh',
  name: 'Rye, whole plant, full ear emergence',
  name_de: 'Roggen, volles Ährenschieben',
  delta_F1: -11,
  delta_C1: 0,
  delta_FR1_QIL: -3.7,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: -1.6,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 170,
  ash: 88,
  OM: 912,
  OMD: 0.77,
  CP: 147,
  CPD: 0.76,
  EE: 35,
  EED: 0.69,
  CF: 288,
  CFD: 0.79,
  NFE: 442,
  NFED: 0.76,
  NDF: 597,
  starch: 0,
  sugar: 124
},
{
  id: 12,
  type: 'fresh',
  name: 'Rye, dough stage, 33% grains',
  name_de: 'Roggen, in der Teigreife, Körneranteil 33 %',
  delta_F1: -11,
  delta_C1: 0,
  delta_FR1_QIL: -3.7,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: -1.6,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 300,
  ash: 75,
  OM: 925,
  OMD: 0.72,
  CP: 109,
  CPD: 0.68,
  EE: 29,
  EED: 0.67,
  CF: 328,
  CFD: 0.75,
  NFE: 459,
  NFED: 0.71,
  NDF: 630,
  starch: 0,
  sugar: 73
},
{
  id: 13,
  type: 'fresh',
  name: 'Grass-clover, 1st growth, budding stage',
  name_de: 'Rotklee-Gras-Gemenge, 1. Aufwuchs, in der Knospe',
  delta_F1: -11,
  delta_C1: 0,
  delta_FR1_QIL: 1,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 4.1,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 170,
  ash: 102,
  OM: 898,
  OMD: 0.75,
  CP: 178,
  CPD: 0.74,
  EE: 32,
  EED: 0.6,
  CF: 223,
  CFD: 0.71,
  NFE: 465,
  NFED: 0.79,
  NDF: 447,
  starch: 0,
  sugar: 30
},
{
  id: 14,
  type: 'fresh',
  name: 'Grass-clover, 1st growth, beginning of bloom',
  name_de: 'Rotklee-Gras-Gemenge, 1. Aufwuchs, Beginn Blüte',
  delta_F1: -11,
  delta_C1: 0,
  delta_FR1_QIL: 1,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 4.1,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 200,
  ash: 97,
  OM: 903,
  OMD: 0.72,
  CP: 155,
  CPD: 0.66,
  EE: 30,
  EED: 0.45,
  CF: 259,
  CFD: 0.69,
  NFE: 459,
  NFED: 0.76,
  NDF: 476,
  starch: 0,
  sugar: 35
},
{
  id: 15,
  type: 'fresh',
  name: 'Grass-clover, 1st growth, end of bloom',
  name_de: 'Rotklee-Gras-Gemenge, 1. Aufwuchs, verblüht',
  delta_F1: -11,
  delta_C1: 0,
  delta_FR1_QIL: 1,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 4.1,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 200,
  ash: 84,
  OM: 916,
  OMD: 0.61,
  CP: 115,
  CPD: 0.65,
  EE: 30,
  EED: 0.66,
  CF: 333,
  CFD: 0.53,
  NFE: 438,
  NFED: 0.66,
  NDF: 508,
  starch: 0,
  sugar: 41
},
{
  id: 16,
  type: 'fresh',
  name: 'Grass-clover, regrowth, budding stage',
  name_de: 'Rotklee-Gras-Gemenge, 2. Aufwuchs, in der Knospe',
  delta_F1: -11,
  delta_C1: 0,
  delta_FR1_QIL: 1,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 4.1,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 210,
  ash: 105,
  OM: 895,
  OMD: 0.72,
  CP: 191,
  CPD: 0.72,
  EE: 34,
  EED: 0.6,
  CF: 223,
  CFD: 0.69,
  NFE: 447,
  NFED: 0.74,
  NDF: 429,
  starch: 0,
  sugar: 40
},
{
  id: 17,
  type: 'fresh',
  name: 'Grass-clover, regrowth, beginning of bloom',
  name_de: 'Rotklee-Gras-Gemenge, 2. Aufwuchs, Beginn Blüte',
  delta_F1: -11,
  delta_C1: 0,
  delta_FR1_QIL: 1,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 4.1,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 240,
  ash: 105,
  OM: 895,
  OMD: 0.67,
  CP: 172,
  CPD: 0.67,
  EE: 29,
  EED: 0.64,
  CF: 258,
  CFD: 0.59,
  NFE: 436,
  NFED: 0.72,
  NDF: 476,
  starch: 0,
  sugar: 45
},
{
  id: 18,
  type: 'freshmaize',
  name: 'Maize, fresh whole plant, milk stage, 25-35% cobs',
  name_de: 'Mais, frische Ganzpflanze, Milchreife, 25-35 % Kolbenanteil',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 210,
  ash: 55,
  OM: 945,
  OMD: 0.75,
  CP: 90,
  CPD: 0.64,
  EE: 21,
  EED: 0.75,
  CF: 223,
  CFD: 0.66,
  NFE: 611,
  NFED: 0.8,
  NDF: 496,
  starch: 120,
  sugar: 137
},
{
  id: 19,
  type: 'grasssilage',
  name: 'Grass silage, 1st cut of 4 or more, heading stage',
  name_de: 'Grassilage, 4+ Nutzungen, grasreich, 1. Schnitt, Beginn Rispenschieben',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: -1.4,
  delta_S2_QIL: 1.6,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: -1.9,
  delta_S2_QIB: 1.9,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 350,
  ash: 111,
  OM: 889,
  OMD: 0.79,
  CP: 184,
  CPD: 0.8,
  EE: 42,
  EED: 0.55,
  CF: 214,
  CFD: 0.8,
  NFE: 449,
  NFED: 0.79,
  NDF: 412,
  starch: 0,
  sugar: 41
},
{
  id: 20,
  type: 'grasssilage',
  name: 'Grass silage, 1st cut of 4 or more, full ear emergence',
  name_de: 'Grassilage, 4+ Nutzungen, grasreich, 1. Schnitt, volles Rispenschieben',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: -1.4,
  delta_S2_QIL: 1.6,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: -1.9,
  delta_S2_QIB: 1.9,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 350,
  ash: 106,
  OM: 894,
  OMD: 0.71,
  CP: 167,
  CPD: 0.67,
  EE: 41,
  EED: 0.68,
  CF: 247,
  CFD: 0.74,
  NFE: 439,
  NFED: 0.71,
  NDF: 476,
  starch: 0,
  sugar: 41
},
{
  id: 21,
  type: 'grasssilage',
  name: 'Grass silage, 1st cut of 4 or more, beginning of bloom',
  name_de: 'Grassilage, 4+ Nutzungen, grasreich, 1. Schnitt, Beginn Blüte',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: -1.4,
  delta_S2_QIL: 1.6,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: -1.9,
  delta_S2_QIB: 1.9,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 350,
  ash: 109,
  OM: 891,
  OMD: 0.74,
  CP: 155,
  CPD: 0.73,
  EE: 38,
  EED: 0.77,
  CF: 276,
  CFD: 0.78,
  NFE: 422,
  NFED: 0.71,
  NDF: 549,
  starch: 0,
  sugar: 41
},
{
  id: 22,
  type: 'grasssilage',
  name: 'Grass silage, 2nd cut of 4 or more, <4 weeks',
  name_de: 'Grassilage, 4+ Nutzungen, grasreich, 2. Aufwuchs, <4 Wochen',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: -1.4,
  delta_S2_QIL: 1.6,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: -1.9,
  delta_S2_QIB: 1.9,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 350,
  ash: 143,
  OM: 857,
  OMD: 0.73,
  CP: 186,
  CPD: 0.71,
  EE: 42,
  EED: 0.62,
  CF: 213,
  CFD: 0.77,
  NFE: 416,
  NFED: 0.73,
  NDF: 410,
  starch: 0,
  sugar: 27
},
{
  id: 23,
  type: 'grasssilage',
  name: 'Grass silage, 2nd cut of 4 or more, 4-6 weeks',
  name_de: 'Grassilage, 4+ Nutzungen, grasreich, 2. Aufwuchs, 4-6  Wochen',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: -1.4,
  delta_S2_QIL: 1.6,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: -1.9,
  delta_S2_QIB: 1.9,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 350,
  ash: 113,
  OM: 887,
  OMD: 0.7,
  CP: 161,
  CPD: 0.66,
  EE: 42,
  EED: 0.58,
  CF: 246,
  CFD: 0.74,
  NFE: 438,
  NFED: 0.71,
  NDF: 442,
  starch: 0,
  sugar: 27
},
{
  id: 24,
  type: 'grasssilage',
  name: 'Grass silage, 2nd cut of 4 or more, 7-9 weeks',
  name_de: 'Grassilage, 4+ Nutzungen, grasreich, 2. Aufwuchs, 7-9 Wochen',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: -1.4,
  delta_S2_QIL: 1.6,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: -1.9,
  delta_S2_QIB: 1.9,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 350,
  ash: 115,
  OM: 885,
  OMD: 0.72,
  CP: 136,
  CPD: 0.68,
  EE: 37,
  EED: 0.6,
  CF: 295,
  CFD: 0.75,
  NFE: 417,
  NFED: 0.73,
  NDF: 532,
  starch: 0,
  sugar: 26
},
{
  id: 25,
  type: 'grasssilage',
  name: 'Lucerne, 1st cut, budding stage',
  name_de: 'Luzerne, 1. Aufwuchs, in der Knospe',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 2.8,
  delta_S2_QIL: 1.6,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 2.8,
  delta_S2_QIB: 1.9,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 350,
  ash: 118,
  OM: 882,
  OMD: 0.66,
  CP: 207,
  CPD: 0.73,
  EE: 39,
  EED: 0.57,
  CF: 254,
  CFD: 0.54,
  NFE: 382,
  NFED: 0.72,
  NDF: 410,
  starch: 0,
  sugar: 1
},
{
  id: 26,
  type: 'grasssilage',
  name: 'Lucerne, 1st cut, beginning of bloom',
  name_de: 'Luzerne, 1. Aufwuchs, Beginn Blüte',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 2.8,
  delta_S2_QIL: 1.6,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 2.8,
  delta_S2_QIB: 1.9,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 350,
  ash: 125,
  OM: 875,
  OMD: 0.63,
  CP: 179,
  CPD: 0.69,
  EE: 37,
  EED: 0.57,
  CF: 294,
  CFD: 0.54,
  NFE: 365,
  NFED: 0.68,
  NDF: 472,
  starch: 0,
  sugar: 1
},
{
  id: 27,
  type: 'grasssilage',
  name: 'Grass-clover, 1st cut, budding stage',
  name_de: 'Rotklee-Gras-Gemenge, 1. Aufwuchs, in der Knospe',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 2.8,
  delta_S2_QIL: 1.6,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 2.8,
  delta_S2_QIB: 1.9,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 350,
  ash: 92,
  OM: 908,
  OMD: 0.76,
  CP: 173,
  CPD: 0.74,
  EE: 45,
  EED: 0.64,
  CF: 246,
  CFD: 0.76,
  NFE: 444,
  NFED: 0.79,
  NDF: 432,
  starch: 0,
  sugar: 20
},
{
  id: 28,
  type: 'grasssilage',
  name: 'Grass-clover, 1st cut, beginning of bloom',
  name_de: 'Rotklee-Gras-Gemenge, 1. Aufwuchs, Beginn Blüte',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 2.8,
  delta_S2_QIL: 1.6,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 2.8,
  delta_S2_QIB: 1.9,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 350,
  ash: 110,
  OM: 890,
  OMD: 0.73,
  CP: 165,
  CPD: 0.69,
  EE: 53,
  EED: 0.61,
  CF: 278,
  CFD: 0.76,
  NFE: 394,
  NFED: 0.74,
  NDF: 473,
  starch: 0,
  sugar: 10
},
{
  id: 29,
  type: 'grasssilage',
  name: 'Grass-clover, 1st cut, end of bloom',
  name_de: 'Rotklee-Gras-Gemenge, 1. Aufwuchs, verblüht',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 2.8,
  delta_S2_QIL: 1.6,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 2.8,
  delta_S2_QIB: 1.9,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 350,
  ash: 115,
  OM: 884,
  OMD: 0.67,
  CP: 118,
  CPD: 0.69,
  EE: 46,
  EED: 0.73,
  CF: 368,
  CFD: 0.7,
  NFE: 352,
  NFED: 0.63,
  NDF: 585,
  starch: 0,
  sugar: 5
},
{
  id: 30,
  type: 'grasssilage',
  name: 'Grass-clover, regrowth, budding stage',
  name_de: 'Rotklee-Gras-Gemenge, 2. Aufwuchs, in der Knospe',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 2.8,
  delta_S2_QIL: 1.6,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 2.8,
  delta_S2_QIB: 1.9,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 350,
  ash: 114,
  OM: 886,
  OMD: 0.75,
  CP: 190,
  CPD: 0.74,
  EE: 53,
  EED: 0.7,
  CF: 246,
  CFD: 0.8,
  NFE: 397,
  NFED: 0.75,
  NDF: 432,
  starch: 0,
  sugar: 20
},
{
  id: 31,
  type: 'grasssilage',
  name: 'Grass-clover, regrowth, beginning of bloom',
  name_de: 'Rotklee-Gras-Gemenge, 2. Aufwuchs, Beginn Blüte',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 2.8,
  delta_S2_QIL: 1.6,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 2.8,
  delta_S2_QIB: 1.9,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 350,
  ash: 131,
  OM: 869,
  OMD: 0.67,
  CP: 173,
  CPD: 0.65,
  EE: 42,
  EED: 0.65,
  CF: 261,
  CFD: 0.64,
  NFE: 393,
  NFED: 0.69,
  NDF: 441,
  starch: 0,
  sugar: 20
},
{
  id: 32,
  type: 'maizesilage',
  name: 'Maize silage, milk stage, medium corncob proportion',
  name_de: 'Maissilage, Milchreife, Kolbenanteil mittel',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 210,
  ash: 59,
  OM: 941,
  OMD: 0.7,
  CP: 93,
  CPD: 0.58,
  EE: 31,
  EED: 0.69,
  CF: 233,
  CFD: 0.65,
  NFE: 584,
  NFED: 0.74,
  NDF: 477,
  starch: 131,
  sugar: 9
},
{
  id: 33,
  type: 'maizesilage',
  name: 'Maize silage, dough stage, medium corncob proportion',
  name_de: 'Maissilage, Teigreife, mittlerer Körneranteil',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 270,
  ash: 52,
  OM: 948,
  OMD: 0.72,
  CP: 88,
  CPD: 0.58,
  EE: 33,
  EED: 0.79,
  CF: 212,
  CFD: 0.63,
  NFE: 615,
  NFED: 0.76,
  NDF: 444,
  starch: 203,
  sugar: 13
},
{
  id: 34,
  type: 'maizesilage',
  name: 'Maize silage, end of dough stage, high corncob proportion',
  name_de: 'Maissilage, Ende der Teigreife, Kolbenanteil hoch',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 380,
  ash: 43,
  OM: 957,
  OMD: 0.75,
  CP: 80,
  CPD: 0.61,
  EE: 34,
  EED: 0.74,
  CF: 177,
  CFD: 0.63,
  NFE: 666,
  NFED: 0.8,
  NDF: 416,
  starch: 345,
  sugar: 10
},
{
  id: 35,
  type: 'maizesilage',
  name: 'Maize corncobs without husks (Corn-Cob-Mix)',
  name_de: 'Maiskolben ohne Hüllblätter (CCM) siliert',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 600,
  ash: 21,
  OM: 979,
  OMD: 0.84,
  CP: 105,
  CPD: 0.69,
  EE: 43,
  EED: 0.8,
  CF: 52,
  CFD: 0.42,
  NFE: 779,
  NFED: 0.93,
  NDF: 152,
  starch: 634,
  sugar: 4
},
{
  id: 36,
  type: 'wholecropsilage',
  name: 'Faba bean, whole plant silage',
  name_de: 'Ackerbohnensilage, Gelbreife',
  delta_F1: -11,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 300,
  ash: 81,
  OM: 919,
  OMD: 0.68,
  CP: 180,
  CPD: 0.69,
  EE: 23,
  EED: 0.77,
  CF: 302,
  CFD: 0.48,
  NFE: 414,
  NFED: 0.82,
  NDF: 437,
  starch: 129,
  sugar: 30
},
{
  id: 37,
  type: 'wholecropsilage',
  name: 'Barley, whole plant silage, ear emergence',
  name_de: 'Grünroggensilage, Ährenschieben',
  delta_F1: -11,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 190,
  ash: 101,
  OM: 899,
  OMD: 0.73,
  CP: 136,
  CPD: 0.69,
  EE: 38,
  EED: 0.68,
  CF: 299,
  CFD: 0.76,
  NFE: 426,
  NFED: 0.71,
  NDF: 415,
  starch: 0,
  sugar: 2
},
{
  id: 38,
  type: 'wholecropsilage',
  name: 'Oat, whole plant silage, ear emergence',
  name_de: 'Grünhafersilage, Ährenschieben',
  delta_F1: -11,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 170,
  ash: 89,
  OM: 911,
  OMD: 0.71,
  CP: 103,
  CPD: 0.65,
  EE: 38,
  EED: 0.76,
  CF: 285,
  CFD: 0.69,
  NFE: 485,
  NFED: 0.74,
  NDF: 469,
  starch: 0,
  sugar: 2
},
{
  id: 39,
  type: 'wholecropsilage',
  name: 'Oat, whole plant silage, dough stage, 33% grains',
  name_de: 'Grünhafersilage, Teigreife, Körneranteil 33%',
  delta_F1: -11,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 300,
  ash: 81,
  OM: 919,
  OMD: 0.59,
  CP: 92,
  CPD: 0.56,
  EE: 34,
  EED: 0.66,
  CF: 312,
  CFD: 0.59,
  NFE: 481,
  NFED: 0.6,
  NDF: 450,
  starch: 104,
  sugar: 5
},
{
  id: 40,
  type: 'wholecropsilage',
  name: 'Sugar beets, ensiled pressed pulp',
  name_de: 'Preßschnitzel',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 220,
  ash: 71,
  OM: 929,
  OMD: 0.86,
  CP: 111,
  CPD: 0.62,
  EE: 11,
  EED: 0.31,
  CF: 208,
  CFD: 0.87,
  NFE: 599,
  NFED: 0.91,
  NDF: 482,
  starch: 0,
  sugar: 31
},
{
  id: 41,
  type: 'wholecropsilage',
  name: 'Sugar beet, ensiled clean leaves',
  name_de: 'Zuckerrübenblatt, sauber',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 160,
  ash: 171,
  OM: 829,
  OMD: 0.76,
  CP: 149,
  CPD: 0.71,
  EE: 34,
  EED: 0.51,
  CF: 159,
  CFD: 0.72,
  NFE: 487,
  NFED: 0.8,
  NDF: 506,
  starch: 0,
  sugar: 16
},
{
  id: 42,
  type: 'hay',
  name: 'Grass-clover, 1st cut, budding stage',
  name_de: 'Rotklee-Gras Gemenge, 1. Schnitt, in der Knospe',
  delta_F1: -11,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 2.6,
  delta_H2_QIL: 5.5,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 3.4,
  delta_H2_QIB: 5.2,
  eco: 1,
  DM: 860,
  ash: 94,
  OM: 906,
  OMD: 0.71,
  CP: 136,
  CPD: 0.69,
  EE: 26,
  EED: 0.56,
  CF: 260,
  CFD: 0.7,
  NFE: 484,
  NFED: 0.73,
  NDF: 533,
  starch: 0,
  sugar: 30
},
{
  id: 43,
  type: 'hay',
  name: 'Grass-clover, 1st cut, mid-bloom to end of bloom',
  name_de: 'Rotklee-Gras Gemenge, 1. Schnitt, Mitte bis Ende der Blüte',
  delta_F1: -11,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 2.6,
  delta_H2_QIL: 5.5,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 3.4,
  delta_H2_QIB: 5.2,
  eco: 1,
  DM: 860,
  ash: 83,
  OM: 917,
  OMD: 0.63,
  CP: 124,
  CPD: 0.62,
  EE: 24,
  EED: 0.56,
  CF: 336,
  CFD: 0.58,
  NFE: 433,
  NFED: 0.67,
  NDF: 689,
  starch: 0,
  sugar: 25
},
{
  id: 44,
  type: 'hay',
  name: 'Hay, 1st cut of 2 or 3, full ear emergence',
  name_de: 'Heu, 2-3 Nutzungen, grasreich 1. Schnitt, volles Rispenschieben',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 5.5,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 5.2,
  eco: 1,
  DM: 860,
  ash: 78,
  OM: 922,
  OMD: 0.65,
  CP: 106,
  CPD: 0.59,
  EE: 24,
  EED: 0.47,
  CF: 294,
  CFD: 0.65,
  NFE: 498,
  NFED: 0.68,
  NDF: 600,
  starch: 0,
  sugar: 81
},
{
  id: 45,
  type: 'hay',
  name: 'Hay, 1st cut of 2 or 3, beginning of bloom',
  name_de: 'Heu, 2-3 Nutzungen, grasreich, 1. Schnitt, Beginn Blüte',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 5.5,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 5.2,
  eco: 1,
  DM: 860,
  ash: 78,
  OM: 922,
  OMD: 0.62,
  CP: 94,
  CPD: 0.56,
  EE: 22,
  EED: 0.45,
  CF: 324,
  CFD: 0.63,
  NFE: 482,
  NFED: 0.63,
  NDF: 619,
  starch: 0,
  sugar: 60
},
{
  id: 46,
  type: 'hay',
  name: 'Hay, 1st cut of 2 or 3, mid-bloom to end of bloom',
  name_de: 'Heu, 2-3 Nutzungen, grasreich, 1. Schnitt, Mitte bis Ende Blüte',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 5.5,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 5.2,
  eco: 1,
  DM: 860,
  ash: 77,
  OM: 923,
  OMD: 0.58,
  CP: 91,
  CPD: 0.52,
  EE: 21,
  EED: 0.43,
  CF: 356,
  CFD: 0.6,
  NFE: 455,
  NFED: 0.58,
  NDF: 654,
  starch: 0,
  sugar: 40
},
{
  id: 47,
  type: 'hay',
  name: 'Hay, 2nd cut of 2 or 3, <4 weeks',
  name_de: 'Heu, 2-3 Nutzungen, grasreich, 2. Schnitt, <4 Wochen',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 5.5,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 5.2,
  eco: 1,
  DM: 860,
  ash: 96,
  OM: 904,
  OMD: 0.7,
  CP: 151,
  CPD: 0.65,
  EE: 31,
  EED: 0.5,
  CF: 251,
  CFD: 0.68,
  NFE: 471,
  NFED: 0.73,
  NDF: 548,
  starch: 0,
  sugar: 101
},
{
  id: 48,
  type: 'hay',
  name: 'Hay, 2nd cut of 2 or 3, 4-6 weeks',
  name_de: 'Heu, 2-3 Nutzungen, grasreich, 2. Schnitt, 4-6 Wochen',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 5.5,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 5.2,
  eco: 1,
  DM: 860,
  ash: 95,
  OM: 905,
  OMD: 0.66,
  CP: 133,
  CPD: 0.59,
  EE: 30,
  EED: 0.46,
  CF: 284,
  CFD: 0.64,
  NFE: 458,
  NFED: 0.69,
  NDF: 582,
  starch: 0,
  sugar: 80
},
{
  id: 49,
  type: 'hay',
  name: 'Hay, 2nd cut of 2 or 3, 7-9 weeks',
  name_de: 'Heu, 2-3 Nutzungen, grasreich, 2. Schnitt, 7-9 Wochen',
  delta_F1: 82,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 5.5,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 5.2,
  eco: 1,
  DM: 860,
  ash: 97,
  OM: 903,
  OMD: 0.61,
  CP: 124,
  CPD: 0.58,
  EE: 30,
  EED: 0.46,
  CF: 312,
  CFD: 0.64,
  NFE: 437,
  NFED: 0.59,
  NDF: 604,
  starch: 0,
  sugar: 60
},
{
  id: 50,
  type: 'straw',
  name: 'Barley, straw',
  name_de: 'Gerste, Stroh',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 860,
  ash: 59,
  OM: 941,
  OMD: 0.5,
  CP: 39,
  CPD: 0.1,
  EE: 16,
  EED: 0.41,
  CF: 442,
  CFD: 0.55,
  NFE: 444,
  NFED: 0.48,
  NDF: 798,
  starch: 0,
  sugar: 7
},
{
  id: 51,
  type: 'straw',
  name: 'Oats, straw',
  name_de: 'Hafer, Stroh',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 860,
  ash: 66,
  OM: 934,
  OMD: 0.5,
  CP: 35,
  CPD: 0.3,
  EE: 15,
  EED: 0.34,
  CF: 440,
  CFD: 0.58,
  NFE: 444,
  NFED: 0.44,
  NDF: 796,
  starch: 0,
  sugar: 14
},
{
  id: 52,
  type: 'straw',
  name: 'Wheat, straw',
  name_de: 'Weizen, Stroh',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 860,
  ash: 78,
  OM: 922,
  OMD: 0.47,
  CP: 37,
  CPD: 0.27,
  EE: 13,
  EED: 0.43,
  CF: 429,
  CFD: 0.56,
  NFE: 443,
  NFED: 0.42,
  NDF: 798,
  starch: 0,
  sugar: 8
},
{
  id: 53,
  type: 'concentrate',
  name: 'Barley, grain',
  name_de: 'Gerste (Winter), Körner',
  delta_F1: 0,
  delta_C1: 36,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 880,
  ash: 27,
  OM: 973,
  OMD: 0.85,
  CP: 124,
  CPD: 0.74,
  EE: 27,
  EED: 0.77,
  CF: 57,
  CFD: 0.32,
  NFE: 765,
  NFED: 0.92,
  NDF: 216,
  starch: 599,
  sugar: 18
},
{
  id: 54,
  type: 'concentrate',
  name: 'Faba beans, grain',
  name_de: 'Ackerbohnen',
  delta_F1: 0,
  delta_C1: -87,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 880,
  ash: 39,
  OM: 961,
  OMD: 0.91,
  CP: 298,
  CPD: 0.86,
  EE: 16,
  EED: 0.75,
  CF: 89,
  CFD: 0.86,
  NFE: 558,
  NFED: 0.94,
  NDF: 161,
  starch: 422,
  sugar: 41
},
{
  id: 55,
  type: 'concentrate',
  name: 'Maize, grain',
  name_de: 'Mais, Körner',
  delta_F1: 0,
  delta_C1: 75,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 880,
  ash: 17,
  OM: 983,
  OMD: 0.86,
  CP: 106,
  CPD: 0.66,
  EE: 45,
  EED: 0.83,
  CF: 26,
  CFD: 0.46,
  NFE: 806,
  NFED: 0.9,
  NDF: 120,
  starch: 694,
  sugar: 19
},
{
  id: 56,
  type: 'concentrate',
  name: 'Oats, grain',
  name_de: 'Hafer, Körner',
  delta_F1: 0,
  delta_C1: 75,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 880,
  ash: 33,
  OM: 967,
  OMD: 0.74,
  CP: 121,
  CPD: 0.74,
  EE: 53,
  EED: 0.88,
  CF: 116,
  CFD: 0.29,
  NFE: 677,
  NFED: 0.8,
  NDF: 312,
  starch: 452,
  sugar: 16
},
{
  id: 57,
  type: 'concentrate',
  name: 'Peas, grain',
  name_de: 'Erbsen',
  delta_F1: 0,
  delta_C1: -87,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 880,
  ash: 34,
  OM: 966,
  OMD: 0.9,
  CP: 251,
  CPD: 0.82,
  EE: 15,
  EED: 0.62,
  CF: 67,
  CFD: 0.78,
  NFE: 633,
  NFED: 0.95,
  NDF: 155,
  starch: 478,
  sugar: 61
},
{
  id: 58,
  type: 'concentrate',
  name: 'Rye, grain',
  name_de: 'Roggen, Körner',
  delta_F1: 0,
  delta_C1: 36,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 880,
  ash: 21,
  OM: 979,
  OMD: 0.9,
  CP: 112,
  CPD: 0.69,
  EE: 18,
  EED: 0.58,
  CF: 27,
  CFD: 0.47,
  NFE: 822,
  NFED: 0.94,
  NDF: 132,
  starch: 632,
  sugar: 68
},
{
  id: 59,
  type: 'concentrate',
  name: 'Triticale, grain',
  name_de: 'Triticale, Körner',
  delta_F1: 0,
  delta_C1: 36,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 880,
  ash: 22,
  OM: 978,
  OMD: 0.89,
  CP: 145,
  CPD: 0.71,
  EE: 18,
  EED: 0.65,
  CF: 28,
  CFD: 0.32,
  NFE: 787,
  NFED: 0.93,
  NDF: 146,
  starch: 640,
  sugar: 40
},
{
  id: 60,
  type: 'concentrate',
  name: 'Wheat, grain',
  name_de: 'Weizen (Winter), Körner',
  delta_F1: 0,
  delta_C1: 36,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 880,
  ash: 19,
  OM: 981,
  OMD: 0.89,
  CP: 138,
  CPD: 0.78,
  EE: 20,
  EED: 0.78,
  CF: 29,
  CFD: 0.41,
  NFE: 794,
  NFED: 0.93,
  NDF: 143,
  starch: 662,
  sugar: 33
},
{
  id: 61,
  type: 'concentrate',
  name: 'Brewer\'s grains, silage',
  name_de: 'Biertrebersilage',
  delta_F1: 0,
  delta_C1: 0,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 260,
  ash: 48,
  OM: 952,
  OMD: 0.68,
  CP: 249,
  CPD: 0.82,
  EE: 86,
  EED: 0.92,
  CF: 193,
  CFD: 0.54,
  NFE: 424,
  NFED: 0.6,
  NDF: 575,
  starch: 17,
  sugar: 6
},
{
  id: 62,
  type: 'concentrate',
  name: 'Lucerne, dehydrated meal, immature',
  name_de: 'Grünmehl, Luzerne, jung',
  delta_F1: 0,
  delta_C1: 46,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 900,
  ash: 118,
  OM: 882,
  OMD: 0.7,
  CP: 218,
  CPD: 0.77,
  EE: 35,
  EED: 0.41,
  CF: 222,
  CFD: 0.54,
  NFE: 407,
  NFED: 0.76,
  NDF: 398,
  starch: 0,
  sugar: 53
},
{
  id: 63,
  type: 'concentrate',
  name: 'Rapeseed, cake 15% ether extracts',
  name_de: 'Rapskuchen, 15% Fett',
  delta_F1: 0,
  delta_C1: 36,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 900,
  ash: 69,
  OM: 931,
  OMD: 0.8,
  CP: 350,
  CPD: 0.86,
  EE: 155,
  EED: 0.9,
  CF: 111,
  CFD: 0.41,
  NFE: 315,
  NFED: 0.84,
  NDF: 254,
  starch: 0,
  sugar: 95
},
{
  id: 64,
  type: 'concentrate',
  name: 'Rapeseed, expeller',
  name_de: 'Rapsextraktionsschrot',
  delta_F1: 0,
  delta_C1: 36,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: NaN,
  DM: 890,
  ash: 77,
  OM: 923,
  OMD: 0.8,
  CP: 399,
  CPD: 0.84,
  EE: 25,
  EED: 0.78,
  CF: 131,
  CFD: 0.5,
  NFE: 368,
  NFED: 0.86,
  NDF: 300,
  starch: 0,
  sugar: 80
},
{
  id: 65,
  type: 'concentrate',
  name: 'Soybean seeds, heat treated',
  name_de: 'Sojabohnen, dampferhitzt',
  delta_F1: 0,
  delta_C1: -46,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 935,
  ash: 54,
  OM: 946,
  OMD: 0.86,
  CP: 398,
  CPD: 0.9,
  EE: 203,
  EED: 0.91,
  CF: 62,
  CFD: 0.69,
  NFE: 283,
  NFED: 0.8,
  NDF: 132,
  starch: 57,
  sugar: 81
},
{
  id: 66,
  type: 'concentrate',
  name: 'Soybean meal, partly dehulled, heat treated',
  name_de: 'Sojaextraktionsschrot geschält, dampferhitzt',
  delta_F1: 0,
  delta_C1: -46,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 0,
  DM: 890,
  ash: 67,
  OM: 933,
  OMD: 0.92,
  CP: 548,
  CPD: 0.92,
  EE: 13,
  EED: 0.68,
  CF: 39,
  CFD: 0.85,
  NFE: 333,
  NFED: 0.93,
  NDF: 90,
  starch: 69,
  sugar: 115
},
{
  id: 67,
  type: 'concentrate',
  name: 'Sunflower seed meal, partly dehulled',
  name_de: 'Sonnenblumenextraktionsschrot, teilgesch.',
  delta_F1: 0,
  delta_C1: -46,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 0,
  DM: 900,
  ash: 70,
  OM: 930,
  OMD: 0.65,
  CP: 379,
  CPD: 0.85,
  EE: 24,
  EED: 0.85,
  CF: 223,
  CFD: 0.27,
  NFE: 304,
  NFED: 0.7,
  NDF: 378,
  starch: 0,
  sugar: 68
},
{
  id: 68,
  type: 'concentrate',
  name: 'Sunflower cake, partly dehulled, 4-8% ether extracts',
  name_de: 'Sonnenblumenkuchen, teilentschält, 4-8% Fett',
  delta_F1: 0,
  delta_C1: -46,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: NaN,
  DM: 910,
  ash: 66,
  OM: 934,
  OMD: 0.65,
  CP: 390,
  CPD: 0.85,
  EE: 62,
  EED: 0.85,
  CF: 206,
  CFD: 0.27,
  NFE: 276,
  NFED: 0.7,
  NDF: 349,
  starch: 0,
  sugar: 85
},
{
  id: 69,
  type: 'concentrate',
  name: 'Wheat, bran',
  name_de: 'Weizenkleie',
  delta_F1: 0,
  delta_C1: 75,
  delta_FR1_QIL: 0,
  delta_S1_QIL: 0,
  delta_S2_QIL: 0,
  delta_H1_QIL: 0,
  delta_H2_QIL: 0,
  delta_FR1_QIB: 0,
  delta_S1_QIB: 0,
  delta_S2_QIB: 0,
  delta_H1_QIB: 0,
  delta_H2_QIB: 0,
  eco: 1,
  DM: 880,
  ash: 65,
  OM: 935,
  OMD: 0.67,
  CP: 160,
  CPD: 0.76,
  EE: 43,
  EED: 0.59,
  CF: 134,
  CFD: 0.33,
  NFE: 598,
  NFED: 0.73,
  NDF: 580,
  starch: 149,
  sugar: 64
}
];
