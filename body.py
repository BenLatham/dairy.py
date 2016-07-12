# Body condition score, mobilization and body weight.
#
# REFERENCES
#
# Friggens, N.C., Ingvartsen, K.L. and Emmans, G.C. 2004. Prediction of body lipid change in pregnancy and lactation.
# Journal of Dairy Science 87(4):988–1000.
#
# Johnson, I.R. 2008. Biophysical pasture model documentation: model documentation for DairyMod, EcoMod and the SGS
# Pasture Model. IMJ Consultants, Armidale, NSW, Australia. p. 144. Available at:
# http://imj.com.au/wp-content/uploads/2014/08/GrazeMod.pdf
#
# Johnson, I.R. 2013. DairyMod and the SGS Pasture Model: a mathematical description of the biophysical model structure.
# IMJ Consultants, Darrigo, NSW, Australia. p. 120. Available at:
# http://imj.com.au/wp-content/uploads/2014/08/DM_SGS_documentation.pdf
#
# Metzner, M., Heuwieser, W. und Klee, W. 1993. Die Beurteilung der Körperkondition (body condition scoring) im
# Herdenmanagement. Der praktische Tierarzt 74(11):991–998.
#
# Wright, I.A. and Russel, A.J.F. 1984a. Partition of fat, body composition and body condition score in mature cows.
# Animal Science 38(1):23-32.
#
# Wright, I.A. and Russel, A.J.F. 1984b. Estimation in vivo of the chemical composition of the bodies of mature cows.
# Animal Science 38(1):33-44.
#
# LICENSE
#
# Copyright 2014 Jan Vaillant   <jan.vaillant@zalf.de>
# Copyright 2014 Lisa Baldinger <lisa.baldinger@boku.ac.at>
#
# Distributed under the MIT License. See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT
#
# Any publication for which this file or a derived work is used must include an a reference to:
#
# Vaillant, J. and Baldinger, L. 2016.
# Application note: An open-source JavaScript library to simulate dairy cows and young stock,
# their growth, requirements and diets.
# Computers and Electronics in Agriculture, Volume 120, January 2016, Pages 7–9
#
# TODO:
# - reference for "DAYS_ZERO_MOBILIZATION_AFTER_MILK_PEAK"
# - improve BCS function
# - implement either "full" Friggens approach or investigate how to "reasonably" relate mobilization, day max milk, day
#   min milk solids, day of conception ...

import math

pow = math.pow
log = math.log
exp = math.exp
DAYS_IN_MONTH = 30.5
DAYS_ZERO_MOBILIZATION_AFTER_MILK_PEAK = 55

# BCS maximum
BCS_MAX = 3.5
# BCS minimum
BCS_MIN = 3.0

#   Metzner et. al. (1993)
#   We assume BCS of BCS_MAX during dry period and a minimum BCS at day d_mx + 55.
#   BCS is everywhere expressed on a six point scale.
#
#   BCS     [-]     body condition score
#   DIM     [day]   days in milk
#   CI      [month] calving interval in month
#   DP      [day]   dry period in days
#   d_mx    [day]   day milk peaks



def BCS(DIM, CI, DP, d_mx):
    # calving interval in days
    CI_d = CI * DAYS_IN_MONTH
    BCS = BCS_MAX
    BWC_0 = DAYS_ZERO_MOBILIZATION_AFTER_MILK_PEAK + d_mx
    if DIM <= BWC_0:
        BCS = BCS_MAX - ((BCS_MAX - BCS_MIN) / BWC_0) * DIM
    elif DIM <= CI_d - DP:
        BCS = BCS_MIN + ((BCS_MAX - BCS_MIN) / (CI_d - DP - BWC_0)) * (DIM - BWC_0)
    return BCS

#   Johnson (2008) eq. 7.8a
#
#   W       [kg]      weight of cow or young stock at day age
#   age     [day]     age in days
#   age_c1  [month]   age first calving
#   W_b     [kg]      weight of calf at birth
#   W_c1    [kg kg-1] fraction (recommended) of mature body weight at first calving
#   W_m     [kg]      weight of mature cow
# */
#
def W(age, age_c1, W_b, W_c1, W_m):
    W = 0

    # / *make sure W_c1 < 1 * /
    if (W_c1 >= 1): W_c1 = 0.99

    # / *growth parameter(solve W_m * W_c1 = W_m - (W_m - W_b) * exp(-k * age) for k) * /
    k = log((W_b - W_m) / (W_m * (W_c1 - 1))) / (age_c1 * DAYS_IN_MONTH)
    W = W_m - (W_m - W_b) * exp(-k * age)

#   # make sure mature body weight is reached at some point (W_m is an asymptote) */
#   // W = (W >= W_m - 1) ? W_m: W // TODO: round ?

    return W


#   Johnson IR (2005 & 2008), eq. 7.6
#
#   Calf birth weight.
#
#   W_b [kg]  weight of calf at birth
#   W_m [kg]  weight of mature cow


def W_b(W_m):
    W_b = 0
    # parameters for cattle, table 7.3

    c_b = -2
    m_b = 0.066
    W_b = c_b + m_b * W_m
    return W_b


#   Wright, Russel (1984b) table 2, Wright, Russel (1984a) table 1
#
#   Mobilization of body fat in early lactation.
#
#   TODO:
#     - body lipid change to body weight change conversion?
#
#   W_mob [kg]    mobilized body fat
#   W_m   [kg]    mature body weight
#   type  [enum]  cow type (milk or dual)


def W_mob(W_m, type):
    if type == 'dual':
        b_1 = 52.3
        W_ref = 542
    else:
        b_1 = 84.2
        W_ref =560
    BCS_mx = 3.5
    BCS_mn = 3.0
    W_mob = b_1 * (BCS_mx - BCS_mn) * W_m / W_ref
    return W_mob

#   Friggens et. al. (2004)
#
#   Body weight change of young stock and cows (dry or lactating). Simplified version of Friggens' approach.
#
#   We assume that..
#
#   * the day of zero mobilization is 55 days after milk peaks (d_0).
#   * either the cow mobilizes or gains weight, there is no longer period w/o weight change.
#   * a mature cow gains after d_0 the same amout of body weight she lost till day d_0.
#   * a growing cow will additionally gain the total body weight she should gain according to growth (W) function within
#     the total lactaion after d_0 (i.e. she will not grow during mobilization but compensate those "losses", "non-gains").
#
#   TODO:
#   - fat vs body weight (tissue). fat === body weight ?
#
#   BWC     [kg d-1]  body weight change
#   DPP     [day]     days post partum
#   d_mx    [day]     day milk peaks
#   age     [day]     cow's age in days
#   CI      [m]       calving interval in month
#   W_m     [kg]      mature body weight
#   age_c1  [month]   age first calving
#   W_b     [kg]      weight of calf at birth
#   W_c1    [kg kg-1] fraction (recommended) of mature body weight at first calving
#   type    [enum]    cow type (milk or dual)

def BWC (DPP, d_mx, age, CI, W_m, age_c1, W_b, W_c1, type):
    BWC = 0
    # month to days
    CI = CI * DAYS_IN_MONTH

    # day of zero mobilization
    d_0 = d_mx + DAYS_ZERO_MOBILIZATION_AFTER_MILK_PEAK

    if (age < age_c1 * DAYS_IN_MONTH):  ## young stock
        BWC = W(age, age_c1, W_b, W_c1, W_m) - W(age - 1, age_c1, W_b, W_c1, W_m)

    else: # cows
        # body weight mobilized [kg]
        mob = W_mob(W(age - DPP, age_c1, W_b, W_c1, W_m), type)

        if DPP < d_0: # cow is mobilizing
            BWC = (2 * DPP * mob / pow(d_0, 2)) - (2 * mob / d_0)

        elif (DPP > d_0):  # cow is gaining weight
            # total growth in between two calvings
            G = W(age - DPP + CI, age_c1, W_b, W_c1, W_m) - W(age - DPP, age_c1, W_b, W_c1, W_m)

            # growth weight gain at day age
            dG = 2 * G / pow(CI - d_0, 2) * (DPP - d_0)

            # weight gain reconstitution at day age
            dW_mob = 2 * mob / pow(CI - d_0, 2) * (DPP - d_0)

            BWC = dG + dW_mob
    return BWC

#   Friggens et. al. (2004)
#
#   Body weight change of young stock and cows (dry or lactating).
#
#   BW      [kg]      body weight at day age
#   DPP     [day]     days post partum
#   d_mx    [day]     day milk peaks
#   age     [day]     cow's age in days
#   CI      [m]       calving interval in month
#   W_m     [kg]      mature body weight
#   age_c1  [month]   age first calving
#   W_b     [kg]      weight of calf at birth
#   W_c1    [kg kg-1] fraction (recommended) of mature body weight at first calving
#   type    [enum]    cow type (milk or dual)

def BW(DPP, d_mx, age, CI, W_m, age_c1, W_b, W_c1, type):
    BW = 0

    # month to days */
    CI = CI * DAYS_IN_MONTH

    # day of zero mobilization */
    d_0 = d_mx + DAYS_ZERO_MOBILIZATION_AFTER_MILK_PEAK

    if age < age_c1 * DAYS_IN_MONTH:  # young stock

        BW = W(age, age_c1, W_b, W_c1, W_m)

    else: # cows

        # body weight mobilized [kg] */
        mob = W_mob(W(age - DPP, age_c1, W_b, W_c1, W_m), type)

        # body weight at begin of lactation */
        BW = W(age - DPP, age_c1, W_b, W_c1, W_m)

        # integral from 0 to DPP
        if (DPP < d_0): # cow is mobilizing
          BW -= 2 * mob * (d_0 * DPP - pow(DPP, 2) / 2) / pow(d_0, 2)
        else:
          BW -= mob

        if (DPP > d_0): # cow is beyond d_0

            # total growth in between two calvings */
            G = W(age - DPP + CI, age_c1, W_b, W_c1, W_m) - W(age - DPP, age_c1, W_b, W_c1, W_m)

            # integral growth weight gain */
            BW += G * pow(d_0 - DPP, 2) / pow(d_0 - CI, 2)
            # BW += (2 * G * (pow(DPP, 2) / 2 - d_0 * DPP) / pow(CI - d_0, 2))

            # integral weight gain reconstitution at day age */
            BW += mob * pow(d_0 - DPP, 2) / pow(d_0 - CI, 2)
            # BW += (2 * mob * (pow(DPP, 2) / 2 - d_0 * DPP) / pow(CI - d_0, 2))
    return BW


#   Body weight at calving
#
#   BW_c    [kg]      body weight at calving
#   DPP     [day]     days post partum
#   age     [day]     cow's age in days
#   W_m     [kg]      mature body weight
#   age_c1  [month]   age first calving
#   W_b     [kg]      weight of calf at birth
#   W_c1    [kg kg-1] fraction (recommended) of mature body weight at first calving
# */

def BW_c(DPP, age, W_m, age_c1, W_b, W_c1):
    return W(age - DPP, age_c1, W_b, W_c1, W_m)