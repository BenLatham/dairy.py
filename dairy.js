/*
  Body condition score, mobilization and body weight.

  REFERENCES
  
  Friggens, N.C., Ingvartsen, K.L. and Emmans, G.C. 2004. Prediction of body lipid change in pregnancy and lactation.
  Journal of Dairy Science 87(4):988–1000.
  
  Johnson, I.R. 2008. Biophysical pasture model documentation: model documentation for DairyMod, EcoMod and the SGS
  Pasture Model. IMJ Consultants, Armidale, NSW, Australia. p. 144. Available at:
  http://imj.com.au/wp-content/uploads/2014/08/GrazeMod.pdf
  
  Johnson, I.R. 2013. DairyMod and the SGS Pasture Model: a mathematical description of the biophysical model structure.
  IMJ Consultants, Darrigo, NSW, Australia. p. 120. Available at:
  http://imj.com.au/wp-content/uploads/2014/08/DM_SGS_documentation.pdf

  Metzner, M., Heuwieser, W. und Klee, W. 1993. Die Beurteilung der Körperkondition (body condition scoring) im 
  Herdenmanagement. Der praktische Tierarzt 74(11):991–998.
  
  Wright, I.A. and Russel, A.J.F. 1984a. Partition of fat, body composition and body condition score in mature cows.
  Animal Science 38(1):23-32.

  Wright, I.A. and Russel, A.J.F. 1984b. Estimation in vivo of the chemical composition of the bodies of mature cows.
  Animal Science 38(1):33-44.

  LICENSE

  Copyright 2014 Jan Vaillant   <jan.vaillant@zalf.de>
  Copyright 2014 Lisa Baldinger <lisa.baldinger@boku.ac.at>

  Distributed under the MIT License. See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT

  Any publication for which this file or a derived work is used must include an a reference to:

  Vaillant, J. and Baldinger, L. 2016. 
  Application note: An open-source JavaScript library to simulate dairy cows and young stock,
  their growth, requirements and diets.
  Computers and Electronics in Agriculture, Volume 120, January 2016, Pages 7–9

  TODO:
  - reference for "DAYS_ZERO_MOBILIZATION_AFTER_MILK_PEAK"
  - improve BCS function
  - implement either "full" Friggens approach or investigate how to "reasonably" relate mobilization, day max milk, day
    min milk solids, day of conception ...
*/

var dairy = dairy || {};

dairy.body = (function () {

var pow = Math.pow
  , log = Math.log
  , exp = Math.exp
  , DAYS_IN_MONTH = 30.5
  , DAYS_ZERO_MOBILIZATION_AFTER_MILK_PEAK = 55
  ;

/*
  Metzner et. al. (1993)

  We assume BCS of BCS_max during dry period and a minimum BCS at day d_mx + 55.
  BCS is everywhere expressed on a six point scale.

  BCS     [-]     body condition score
  DIM     [day]   days in milk
  CI      [month] calving interval in month
  DP      [day]   dry period in days
  d_mx    [day]   day milk peaks
*/
 
var BCS = function (DIM, CI, DP, d_mx) {

      /* BCS maximum */
  var BCS_max = 3.5
      /* BCS minimum */
    , BCS_min = 3.0
      /* calving interval in days */
    , CI_d = CI * DAYS_IN_MONTH
    , BCS = BCS_max
    , BWC_0 = DAYS_ZERO_MOBILIZATION_AFTER_MILK_PEAK + d_mx
    ;

  if (DIM <= BWC_0)
    BCS = BCS_max - ((BCS_max - BCS_min) / BWC_0) * DIM; 
  else if (DIM <= CI_d - DP) 
    BCS = BCS_min +  ((BCS_max - BCS_min) / (CI_d - DP - BWC_0)) * (DIM - BWC_0);

  return BCS;

};

/*
  Johnson (2008) eq. 7.8a

  W       [kg]      weight of cow or young stock at day age
  age     [day]     age in days
  age_c1  [month]   age first calving
  W_b     [kg]      weight of calf at birth 
  W_c1    [kg kg-1] fraction (recommended) of mature body weight at first calving
  W_m     [kg]      weight of mature cow 
*/

var W = function (age, age_c1, W_b, W_c1, W_m) {

  var W = 0;

  /* make sure W_c1 < 1 */
  W_c1 = (W_c1 >= 1) ? 0.99 : W_c1;

  /* growth parameter (solve W_m * W_c1 = W_m - (W_m - W_b) * exp(-k * age) for k) */
  var k = log((W_b - W_m) / (W_m * (W_c1 - 1))) / (age_c1 * DAYS_IN_MONTH);

  W = W_m - (W_m - W_b) * exp(-k * age);

  /* make sure mature body weight is reached at some point (W_m is an asymptote) */ 
  // W = (W >= W_m - 1) ? W_m : W; // TODO: round ?

  return W;

};

/*
  Johnson IR (2005 & 2008), eq. 7.6

  Calf birth weight.

  W_b [kg]  weight of calf at birth
  W_m [kg]  weight of mature cow
*/

var W_b = function (W_m) {

  var W_b = 0
      /* parameters for cattle, table 7.3 */
    , c_b = -2
    , m_b = 0.066
    ;

  W_b = c_b + m_b * W_m;

  return W_b;

};

/*
  Wright, Russel (1984b) table 2, Wright, Russel (1984a) table 1 

  Mobilization of body fat in early lactation.

  TODO:
    - body lipid change to body weight change conversion?

  W_mob [kg]    mobilized body fat
  W_m   [kg]    mature body weight
  type  [enum]  cow type (milk or dual)
*/

var W_mob = function (W_m, type) {

  var W_mob = 0
    , b_1 = (type === 'dual' ? 52.3 : 84.2)
    , BCS_mx = 3.5
    , BCS_mn = 3.0
    , W_ref = (type === 'dual' ? 542 : 560)
    ;
    
  W_mob = b_1 * (BCS_mx - BCS_mn) * W_m / W_ref;

  return W_mob;

};

/*  
  Friggens et. al. (2004)

  Body weight change of young stock and cows (dry or lactating). Simplified version of Friggens' approach.

  We assume that..

  * the day of zero mobilization is 55 days after milk peaks (d_0).
  * either the cow mobilizes or gains weight, there is no longer period w/o weight change.
  * a mature cow gains after d_0 the same amout of body weight she lost till day d_0.
  * a growing cow will additionally gain the total body weight she should gain according to growth (W) function within
    the total lactaion after d_0 (i.e. she will not grow during mobilization but compensate those "losses", "non-gains").

  TODO:
  - fat vs body weight (tissue). fat === body weight ?

  BWC     [kg d-1]  body weight change
  DPP     [day]     days post partum 
  d_mx    [day]     day milk peaks
  age     [day]     cow's age in days
  CI      [m]       calving interval in month
  W_m     [kg]      mature body weight
  age_c1  [month]   age first calving
  W_b     [kg]      weight of calf at birth 
  W_c1    [kg kg-1] fraction (recommended) of mature body weight at first calving
  type    [enum]    cow type (milk or dual)
*/

var BWC = function (DPP, d_mx, age, CI, W_m, age_c1, W_b, W_c1, type) {

  var BWC = 0;

  /* month to days */
  CI = CI * DAYS_IN_MONTH;

  /* day of zero mobilization */
  var d_0 = d_mx + DAYS_ZERO_MOBILIZATION_AFTER_MILK_PEAK;

  if (age < age_c1 * DAYS_IN_MONTH) { /* young stock */

    BWC = W(age, age_c1, W_b, W_c1, W_m) - W(age - 1, age_c1, W_b, W_c1, W_m);

  } else { /* cows */

    /* body weight mobilized [kg] */
    var mob = W_mob(W(age - DPP, age_c1, W_b, W_c1, W_m), type);
  
    if (DPP < d_0) { /* cow is mobilizing */

      BWC = (2 * DPP * mob / pow(d_0, 2)) - (2 * mob / d_0);
    
    } else if (DPP > d_0) { /* cow is gaining weight */

      /* total growth in between two calvings */
      G = W(age - DPP + CI, age_c1, W_b, W_c1, W_m) - W(age - DPP, age_c1, W_b, W_c1, W_m);

      /* growth weight gain at day age */
      dG = 2 * G / pow(CI - d_0, 2) * (DPP - d_0);

      /* weight gain reconstitution at day age */
      dW_mob = 2 * mob / pow(CI - d_0, 2) * (DPP - d_0);

      BWC = dG + dW_mob;

    }
  }

  return BWC;

};

/*  
  Friggens et. al. (2004)

  Body weight change of young stock and cows (dry or lactating).

  BW      [kg]      body weight at day age
  DPP     [day]     days post partum 
  d_mx    [day]     day milk peaks
  age     [day]     cow's age in days
  CI      [m]       calving interval in month
  W_m     [kg]      mature body weight
  age_c1  [month]   age first calving
  W_b     [kg]      weight of calf at birth 
  W_c1    [kg kg-1] fraction (recommended) of mature body weight at first calving
  type    [enum]    cow type (milk or dual)
*/

var BW = function (DPP, d_mx, age, CI, W_m, age_c1, W_b, W_c1, type) {

  var BW = 0;

  /* month to days */
  CI = CI * DAYS_IN_MONTH;

  /* day of zero mobilization */
  var d_0 = d_mx + DAYS_ZERO_MOBILIZATION_AFTER_MILK_PEAK;

  if (age < age_c1 * DAYS_IN_MONTH) { /* young stock */

    BW = W(age, age_c1, W_b, W_c1, W_m);

  } else { /* cows */

    /* body weight mobilized [kg] */
    var mob = W_mob(W(age - DPP, age_c1, W_b, W_c1, W_m), type);
  
    /* body weight at begin of lactation */
    BW = W(age - DPP, age_c1, W_b, W_c1, W_m);
  
    /* integral from 0 to DPP */
    if (DPP < d_0) /* cow is mobilizing */
      BW -= 2 * mob * (d_0 * DPP - pow(DPP, 2) / 2) / pow(d_0, 2);
    else
      BW -= mob;
    
    if (DPP > d_0) { /* cow is beyond d_0 */

      /* total growth in between two calvings */
      G = W(age - DPP + CI, age_c1, W_b, W_c1, W_m) - W(age - DPP, age_c1, W_b, W_c1, W_m);

      /* integral growth weight gain */
      BW += G * pow(d_0 - DPP, 2) / pow(d_0 - CI, 2);
      // BW += (2 * G * (pow(DPP, 2) / 2 - d_0 * DPP) / pow(CI - d_0, 2));

      /* integral weight gain reconstitution at day age */
      BW += mob * pow(d_0 - DPP, 2) / pow(d_0 - CI, 2);
      // BW += (2 * mob * (pow(DPP, 2) / 2 - d_0 * DPP) / pow(CI - d_0, 2));

    }
  }

  return BW;

};

/*  
  Body weight at calving

  BW_c    [kg]      body weight at calving
  DPP     [day]     days post partum 
  age     [day]     cow's age in days
  W_m     [kg]      mature body weight
  age_c1  [month]   age first calving
  W_b     [kg]      weight of calf at birth 
  W_c1    [kg kg-1] fraction (recommended) of mature body weight at first calving
*/

var BW_c = function (DPP, age, W_m, age_c1, W_b, W_c1) {

  return W(age - DPP, age_c1, W_b, W_c1, W_m);

};

return {

    BWC: BWC
  , weightChange: BWC
  , BW: BW  
  , weight: BW
  , BW_c: BW_c  
  , weightAtCalving: BW_c
  , BCS: BCS
  , conditionScore: BCS
  , W: W
  , weightPotential: W
  , WB: W_b
  , weightAtBirth: W_b

};

}());


/*
  Dairy diet calculation.

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

var dairy = dairy || {};

dairy.diet = (function () {

var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function'
  , ENVIRONMENT_IS_WEB = typeof window === 'object'
  , ENVIRONMENT_IS_WORKER = typeof importScripts === 'function'
  , glpk = null
  , callback = function (result) {};
  ;

/* GLPK 4.53 constants */
var GLP_MIN = 1  /* minimization */
  , GLP_MAX = 2  /* maximization */

    /* kind of structural variable: */
  , GLP_CV  = 1  /* continuous variable */
  , GLP_IV  = 2  /* integer variable */
  , GLP_BV  = 3  /* binary variable */

    /* type of auxiliary/structural variable: */
  , GLP_FR  = 1  /* free (unbounded) variable */
  , GLP_LO  = 2  /* variable with lower bound */
  , GLP_UP  = 3  /* variable with upper bound */
  , GLP_DB  = 4  /* double-bounded variable */
  , GLP_FX  = 5  /* fixed variable */

  , GLP_MSG_OFF = 0  /* no output */
  , GLP_MSG_ERR = 1  /* warning and error messages only */
  , GLP_MSG_ON  = 2  /* normal output */
  , GLP_MSG_ALL = 3  /* full output */
  , GLP_MSG_DBG = 4  /* debug output */

    /* solution status: */
  , GLP_UNDEF  = 1  /* solution is undefined */
  , GLP_FEAS   = 2  /* solution is feasible */
  , GLP_INFEAS = 3  /* solution is infeasible */
  , GLP_NOFEAS = 4  /* no feasible solution exists */
  , GLP_OPT    = 5  /* solution is optimal */
  , GLP_UNBND  = 6  /* solution is unbounded */
  ;

if (ENVIRONMENT_IS_NODE) {
  glpk = require('./lib/glpk.js');
} else if (ENVIRONMENT_IS_WEB) {
  glpk = new Worker('./lib/glpk.js');
  glpk.onmessage = function (evt) {

    if (typeof evt.data === 'object')
      callback(evt.data);
    else
      console.log(evt.data);

  };
}

var get = function (cow, feeds, options) {

  callback = options.cb;

  var RNB_ub = options.RNB_ub
    , RNB_lb = options.RNB_lb
    , conc_mx = options.conc_mx /* should not be larger than 0.5 */
    , eval_sys = options.eval_sys
    , LP = { //Linear programming object {BEN}
        name: name,
        objective: {
          direction: GLP_MAX, //sets the direction of the optimisation to maximisation {BEN}
          name: 'obj', //names this object as the objective {BEN}
          vars: [] //list of variables {BEN}
        },
        subjectTo: [],
        bounds: []
      }
    ;

//list of variables with their coefficients {BEN}
  LP.objective.vars.push({
    name: 'dE', // energy digestibility {BEN}
    coef: -10 
  });

  LP.objective.vars.push({
    name: 'sE',
    coef: -10 
  });

  LP.objective.vars.push({
    name: 'dP',
    coef: -1 
  });

  LP.objective.vars.push({
    name: 'sP',
    coef: -1 
  });

  var subjectTo = [];

  var E_const = { //set the "E constant" -bounds for this constant are fixed at 1 {BEN}
    name: 'E',
    vars: [ 
      { name: 'dE', coef:  1 },
      { name: 'sE', coef: -1 },
    ],
    bnds: { type: GLP_FX, ub: 1.0, lb: 1.0 } 
  }; 

  var P_const = { //set the "P constant" -bounds for this constant are fixed at 1 {BEN}
    name: 'P',
    vars: [ 
      { name: 'dP', coef:  1 },
      { name: 'sP', coef: -1 },
    ],
    bnds: { type: GLP_FX, ub: 1.0, lb: 1.0 } 
  }; 

  var RNB_bnd_type = -1; //set the dafault bound type for ruminant nitrogen balance -1 presumably flags an error e.g if ub<lb  {BEN}
  if (RNB_lb === RNB_ub) // if the two bounds provided are equal then the bound type is fixed  {BEN}
    RNB_bnd_type = GLP_FX;
  else if (RNB_lb === -Infinity && RNB_ub === Infinity) //if both bounds are infinite the bound type is free {BEN}
    RNB_bnd_type = GLP_FR;
  else if (RNB_lb === -Infinity && RNB_ub < Infinity) //if upper bound is infinite the bound type is lower bound {BEN}
    RNB_bnd_type = GLP_UP;
  else if (RNB_lb > -Infinity && RNB_ub === Infinity) //if lower bound is infinite the bound type is upper bound {BEN}
    RNB_bnd_type = GLP_LO;
  else if (RNB_lb != -Infinity && RNB_ub != Infinity) //if both bounds are not equal of infinite type is double bound {BEN}
    RNB_bnd_type = GLP_DB;

  var RNB_const = {
    name: 'RNB',
    vars: [],
    bnds: { 
      type: RNB_bnd_type,
      ub: RNB_ub,
      lb: RNB_lb 
    } 
  };

  var IC_const = {
    name: 'IC',
    vars: [],
    bnds: { type: GLP_FX, ub: cow.IC, lb: cow.IC } 
  };

  var CC_const = {
    name: 'CC',
    vars: [],
    bnds: { type: GLP_UP, ub: 0, lb: 0 } 
  };

  /* add selected feeds */
  for (var f = 0, fs = feeds.length; f < fs; f++) {

    var feed = feeds[f];

    if (conc_mx === 0 && feed.type === 'concentrate')
      continue; //jumps remainder of loop if the option for concentrate in the mix is set to 0 and the current foodstuff is concentrate {BEN}

    E_const.vars.push({
      name: 'F_' + feed.id,
      coef: feed[eval_sys].E / cow.req[eval_sys].total.E
    });

    P_const.vars.push({
      name: 'F_' + feed.id,
      coef: feed.de.P / cow.req.de.total.P
    });

    RNB_const.vars.push({
      name: 'F_' + feed.id,
      coef: feed.de.RNB
    });

    if (feed.type === 'concentrate') {

      IC_const.vars.push({
        name: 'F_' + feed.id,
        coef: cow.FV_c
      });

      CC_const.vars.push({
        name: 'F_' + feed.id,
        coef: (1 - conc_mx) / conc_mx
      });

    } else {

      IC_const.vars.push({
        name: 'F_' + feed.id,
        coef: feed.fr.FV
      });

      CC_const.vars.push({
        name: 'F_' + feed.id,
        coef: -1
      });

    }

  }    

  subjectTo.push(E_const);
  subjectTo.push(P_const);
  subjectTo.push(RNB_const);
    subjectTo.push(IC_const);
  if (conc_mx > 0)
    subjectTo.push(CC_const);

  LP.subjectTo = subjectTo;

  if (ENVIRONMENT_IS_NODE) {
    return { lp: LP, glpk: glpk.solve(LP, GLP_MSG_ALL) };
  } else if (ENVIRONMENT_IS_WEB && typeof callback === 'function') {
    glpk.postMessage({ lp: LP, msg_lev: GLP_MSG_DBG })
    return LP;
  }

};

return {
  get: get,
  glpk: glpk
};

}());


/*
  Dairy cow grouping.

  It creates groups a such that the total deviation of energy and protein requirements relative to the cow's intake 
  capacity from the groups average is minimized (similar to McGilliard 1983). In the resulting groups animals in each 
  group require a "similar" energy and protein density of the ration. The results of each run slightly defer depending on
  the inital guess of k-means. Therefore it runs several times and returns the best result.

  REFERENCES

  McGilliard, M.L., Swisher, J.M. and James, R.E. 1983. Grouping lactating cows by nutritional requirements for feeding.
  Journal of Dairy Science 66(5):1084-1093.

  k-means.js implementation from https://github.com/cmtt/kmeans-js

  LICENSE

  Copyright 2014 Jan Vaillant   <jan.vaillant@zalf.de>
  Copyright 2014 Lisa Baldinger <lisa.baldinger@boku.ac.at>

  Distributed under the MIT License. See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT

  Any publication for which this file or a derived work is used must include an a reference to:

  Vaillant, J. and Baldinger, L. 2016. 
  Application note: An open-source JavaScript library to simulate dairy cows and young stock,
  their growth, requirements and diets.
  Computers and Electronics in Agriculture, Volume 120, January 2016, Pages 7–9

  TODO

  - implement different strategies e.g. (req. intake capacity-1, absolute requirements, days in milk)
*/

var dairy = dairy || {};

dairy.group = (function () {

var round = Math.round
  , floor = Math.floor
  , random = Math.random
  , log = Math.log
  , pow = Math.pow
  , sqrt = Math.sqrt
  , distance =  function(a, b) {
      return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2));
    }
    /* TODO: refactor original code from cmtt kmeans.. */
  , sortBy = function (a, b, c) {
      c = a.slice();
      return c.sort(function (d, e) {
        d = b(d);
        e = b(e);
        return (d < e ? -1 : d > e ? 1 : 0);
      })
    }
  ;


/* returns total of squared differences */ 

var sumSquaredDifferences = function (points, centroids) {

  var sum = 0
    , ps = points.length
    ;

  for (var p = 0; p < ps; p++) {
    var point = points[p]
      , centroid = centroids[point.k]
      , dif_x = pow(point.x - centroid.x, 2)
      , dif_y = pow(point.y - centroid.y, 2)
      ;
    sum += dif_x + dif_y;
  }

  return sum;

};

/* nomalize (0-1) data. Coordinates in original data are altered */

var doNormalize = function (points) {

  var ps = points.length;

  /* get minimum and maximum x */
  points.sort(function (a, b) {
    return a.x - b.x;
  });

  var x_min = points[0].x;
  var x_max = points[ps - 1].x;

  /* get minimum and maximum y */
  points.sort(function (a, b) {
    return a.y - b.y;
  });

  var y_min = points[0].y;
  var y_max = points[ps - 1].y;

  /* normalize */
  for (var p = 0; p < ps; p++) {
    var point = points[p];
    point.x = (point.x - x_min) / (x_max - x_min);
    point.y = (point.y - y_min) / (y_max - y_min);
  }

};

/* k-means++ initialization from https://github.com/cmtt/kmeans-js */

var kmeansplusplus = function (points, ks) {

  var ps = points.length;

  /* determine the amount of tries */
  var D = []
    , ntries = 2 + round(log(ks))
    , centroids = []
    ;

  /* Choose one center uniformly at random from the data points. */
  var p0 = points[floor(random() * ps)];

  centroids.push({
      x: p0.x
    , y: p0.y
    , k: 0
  });

  /* For each data point x, compute D(x), the distance between x and the nearest center that has already been chosen. */
  for (i = 0; i < ps; ++i)
    D[i] = pow(distance(p0, points[i]), 2);

  var Dsum = D.reduce(function(a, b) {
    return a + b;
  });

  /* Choose one new data point at random as a new center, using a weighted probability distribution where a point x is 
    chosen with probability proportional to D(x)2. (Repeated until k centers have been chosen.) */
  for (k = 1; k < ks; ++k) {

    var bestDsum = -1, bestIdx = -1;

    for (i = 0; i < ntries; ++i) {
      var rndVal = floor(random() * Dsum);

      for (var n = 0; n < ps; ++n) {
        if (rndVal <= D[n]) {
          break;
        } else {
          rndVal -= D[n];
        }
      }

      var tmpD = [];
      for (var m = 0; m < ps; ++m) {
        cmp1 = D[m];
        cmp2 = pow(distance(points[m], points[n]), 2);
        tmpD[m] = cmp1 > cmp2 ? cmp2 : cmp1;
      }

      var tmpDsum = tmpD.reduce(function(a, b) {
        return a + b;
      });

      if (bestDsum < 0 || tmpDsum < bestDsum) {
        bestDsum = tmpDsum, bestIdx = n;
      }
    }

    Dsum = bestDsum;

    var centroid = {
        x: points[bestIdx].x
      , y: points[bestIdx].y
      , k: k
    };

    centroids.push(centroid);

    for (i = 0; i < ps; ++i) {
      cmp1 = D[i];
      cmp2 = pow(distance(points[bestIdx], points[i]), 2);
      D[i] = cmp1 > cmp2 ? cmp2 : cmp1;
    }
  }

  /* sort descending if x is energy density */
  centroids.sort(function (a, b) {
    return b.x - a.x;
  });
  
  /* set k === index */
  for (var c = 0, cs = centroids.length; c < cs; c++)
    centroids[c].k = c;

  return centroids;

};

var kmeans = function (points, centroids) {

  var converged = false
    , ks = centroids.length
    , ps = points.length
    ;

  while (!converged) {
    
    var i;
    converged = true;

    /* Prepares the array of sums. */
    var sums = [];
    for (var k = 0; k < ks; k++)
      sums[k] = { x: 0, y: 0, items: 0 };

    /* Find the closest centroid for each point. */
    for (var p = 0; p < ps; ++p) {

      var distances = sortBy(centroids, function (centroid) {
          return distance(centroid, points[p]);
        });

      var closestItem = distances[0];
      var k = closestItem.k;

      /* When the point is not attached to a centroid or the point was attached to some other centroid before,
        the result differs from the previous iteration. */
      if (typeof points[p].k  !== 'number' || points[p].k !== k)
        converged = false;

      /* Attach the point to the centroid */
      points[p].k = k;

      /* Add the points' coordinates to the sum of its centroid */
      sums[k].x += points[p].x;
      sums[k].y += points[p].y;

      ++sums[k].items;
    }

    /* Re-calculate the center of the centroid. */
    for (var k = 0; k < ks; ++k) {
      if (sums[k].items > 0) {
        centroids[k].x = sums[k].x / sums[k].items;
        centroids[k].y = sums[k].y / sums[k].items;
      }
      centroids[k].items = sums[k].items;
    }
  }

};

var get = function (data, options) {

  var ks = options.k
    , runs = options.runs
    , normalize = options.normalize
    , xAttribute = options.xAttribute
    , yAttribute = options.yAttribute
    , points = data
    , result = []
    ;

  if (typeof xAttribute === 'string' && xAttribute.length > 0
    && typeof yAttribute === 'string' && yAttribute.length > 0) {
    /* prepare data: add x, y property */
    for (var p = 0, ps = data.length; p < ps; p++) {
      points[p].x = data[p][xAttribute];
      points[p].y = data[p][yAttribute];
    }  
  }

  if (normalize)
    doNormalize(points);

  for (var run = 0; run < runs; run++) {  

    /* stores result of each run */
    result[run] = { centroids: [], sum: Infinity };
    
    /* inital guess */
    var centroids = kmeansplusplus(points, ks);

    /* store initial centroids from kmeans++ in order to re-run */
    for(var k = 0; k < ks; k++) {
      result[run].centroids[k] = { 
        x: centroids[k].x, 
        y: centroids[k].y
      }
    } 

    /* run kmeans */
    kmeans(points, centroids);

    /* calculate differences */
    result[run].sum = sumSquaredDifferences(points, centroids);
 
  }

  /* find best result */
  result.sort(function (a, b) {
    return a.sum - b.sum; 
  });

  /* re-use initial centroids produced by kmeans++ from best run */
  centroids = [];
  for (var k = 0; k < ks; k++) {
    var centroid = {
        x: result[0].centroids[k].x
      , y: result[0].centroids[k].y
      , k: k
    };
    centroids[k] = centroid;
  }

  /* run again with best initial centroids */
  kmeans(points, centroids);

  return sumSquaredDifferences(points, centroids);

};

return {
  get: get
};

}());


/*
  Simple, deterministic herd structure model

  LICENSE

  Copyright 2014 Jan Vaillant   <jan.vaillant@zalf.de>
  Copyright 2014 Lisa Baldinger <lisa.baldinger@boku.ac.at>

  Distributed under the MIT License. See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT

  Any publication for which this file or a derived work is used must include an a reference to:

  Vaillant, J. and Baldinger, L. 2016. 
  Application note: An open-source JavaScript library to simulate dairy cows and young stock,
  their growth, requirements and diets.
  Computers and Electronics in Agriculture, Volume 120, January 2016, Pages 7–9
  
  TODO
  
    - add calving pattern option (seasonal)
    - add parity 4 (>3) to output
*/

var dairy = dairy || {};

dairy.herd = (function () {

var pow = Math.pow
  , round = Math.round
  , floor = Math.floor
  , ceil = Math.ceil
  , IT_MIN = 1e2 /* min iterations */
  , IT_MAX = 1e6 /* max. iterations */
  , WEEKS_IN_MONTH = 30.5 / 7
  ;

/* constant parameters with default values */
var cons = {
    ageFirstCalving: 24
  , femaleCalfRate: 0.47
  , stillBirthRate: 0.07
  , youngStockCullRate: 0.155
  , replacementRate: 0.30
  , calvingInterval: 12.0
  , herdSize: 100
  , gestationPeriod: 9.0
  , dryPeriode: 2.0
};  

/* variables */
var vars = {
    /* stores cow object of cows of same age in month per index 
      age is month after first calving 
      {
          no:   no. of cows
        , lac:  lactation no.
        , dry:  if cow is dry
        , WG:   week of gestation
        , WL:   week of lactation  
      } */
    cows: []
    /* no. of young stock per age month since birth */
  , young: []
    /* no. of cows */
  , noCows: 0
  , heifersBought: []
  , heifersSold: []
  , lac: []
  , sim: []
};

/* 
  run simulation until herd structure does not change anymore (or no. cows equals zero)
  returns an array of with young stock count per age month and cows with
  
  lac [#]     lactation no.
  dry [bool]  if cow is dry
  WG  [#]     week of gestation
  WL  [#]     week of lactation
  age [month]

  initialize parameters (object)

  ageFirstCalving     [month]
  femaleCalfRate      [-]     fraction female calfes of all calves born
  stillBirthRate      [-]     fraction of dead born calves
  youngStockCullRate  [-]     fraction of young stock that do not make it to 1st lactation
  replacementRate     [-]     fraction of cows replaced each year
  calvingInterval     [month] month inbetween clavings
  herdSize            [#]     no. of cows in herd
  gestationPeriod     [month] length gestation period
  dryPeriode          [month] length dry period
*/

var get = function (options) {

  /* overwrite default default values if provided and valid */
  for (var prop in options) {
    if (options.hasOwnProperty(prop))
      cons[prop] = (typeof options[prop] === 'number' && !isNaN(options[prop])) ? options[prop] : cons[prop];
  }

  /* reset values */
  vars.cows = [];
  vars.young = [];
  vars.noCows = 0;
  vars.heifersBought = [];
  vars.heifersSold = [];
  vars.sim = [];

  /* varriable shortcuts */
  var ci = cons.calvingInterval
    , hs = cons.herdSize
    , dp = cons.dryPeriode
    , gp = cons.gestationPeriod
    , sb = cons.stillBirthRate
    , yc = cons.youngStockCullRate
    , fc = cons.femaleCalfRate
    , ac = cons.ageFirstCalving
    , rr = cons.replacementRate
    , cows = vars.cows
    , young = vars.young
    , converged = false
    , its = 0 /* no. iterations */
    ;

  /* initialize cow array with some meaningfull values to have a starting point
    cows at age ageFirstCalving + m within calving interval. eqal distribution of status througout calvingInterval */
  var l = 0;
  while (l < 4) { /* just set cows up to lactation 4 (could be any) */ 
    
    for (var m = 0; m < ci; m++) {
      cows[m + l * (ci - 1)] = { 
          no: (hs / ci) / 4 /* devide by 4 because we only initialize for cows till fourth lactation */
        , lac: l + 1
        , dry: (m >= ci - dp) ? true : false
        , WG: (m >= ci - gp) ? (ci - gp) * WEEKS_IN_MONTH : 0
        , WL: (m >= ci - dp) ? 0 : m * WEEKS_IN_MONTH
        , age: ac + ci * (l - 1) + m
      };
      vars.noCows += (hs / ci) / 4;
    }

    l++;
  }

  /* Initialize young stock array. Apply death rate equally distributed as compound interest: 
    K_interest = K_start * (1 + p / 100)^n <=> p / 100 = (K_interest / K_start)^(1/n) - 1
    K_start = (hs / ci) *  (1 - sb) * fc */
  young[0] = (hs / ci) *  (1 - sb) * fc * pow(1 - yc, 1 / ac);
  for (var m = 1; m < ac; m++)
    young[m] = young[m - 1] * pow(1 - yc, 1 / ac); /* no. young stock per age month */

  /* loop until converged i.e. avg. lactation within herd with no. cows equals herd size does not change anymore.
    Each iteration step equals one month */
  while (!converged) {

    /* remove culled young stock */
    for (var y = 0, ys = young.length; y < ys; y++)
      young[y] = young[y] * pow(1 - yc, 1 / ac);

    /* replacement per month; add newly replaced animals to the beginning of the array
      all age classes within herd are equally replaced */

    var newFemaleCalves = 0;
    if (young[young.length - 1] > 0 ) { // heifers available
      /* add new calves to young cattle */
      /* from heifers */
      newFemaleCalves += young[ac - 1] * (1 - sb) * fc;
      /* from cows */
    }

    vars.noCows = 0;
    /* start at age group previously c = 0 */
    for (var c = 0, cs = cows.length; c < cs; c++) {

      var cow = cows[c];

      if (cow.no > 0) {

        /* replacement */
        cow.no = cow.no * (1 - (rr / 12)) // avg monthly replacement
        cow.age++;

        // update pregnancy, dry ...
        if (!cow.dry) {
          cow.WL += WEEKS_IN_MONTH;
          if (cow.WG > 0) {
            cow.WG += WEEKS_IN_MONTH;
          } else {
            if (cow.WL > (ci - gp) * WEEKS_IN_MONTH)
            cow.WG = WEEKS_IN_MONTH;
          }
          /* check if now dry */
          if (cow.WL > (ci - dp) * WEEKS_IN_MONTH) {
            cow.WL = 0;
            cow.dry = true;
          }
        } else { // dry cows
          cow.WG += WEEKS_IN_MONTH;
          /* check if cow calved */
          if (cow.WG > gp * WEEKS_IN_MONTH) {
            newFemaleCalves += cow.no * (1 - sb) * fc;
            cow.lac += 1;
            cow.dry = false;
            cow.WG = 0;
            cow.WL = 0;
          }
        }

      }

      vars.noCows += cow.no;

    } // cows loop

    /* no. available heifers form young stock */
    var noHeifers = young.pop();
    /* move only the no. of heifers that are needed to keep/reach total herdSize */
    var noHeifersToHerd = (vars.noCows < hs) ? ((hs - vars.noCows < noHeifers) ? (hs - vars.noCows) : noHeifers) : 0;
    vars.heifersSold.unshift(noHeifers - noHeifersToHerd);
    
    var noHeifersBought = 0;
    if (noHeifersToHerd < hs - vars.noCows) {
      noHeifersToHerd = hs - vars.noCows;
      noHeifersBought = hs - vars.noCows + noHeifersToHerd;
    }
    vars.heifersBought.unshift(noHeifersBought);

    cows.unshift({
        no: noHeifersToHerd
      , lac: 1
      , dry: false
      , WG: 0
      , WL: 0
      , age: ac
    });

    vars.noCows += noHeifersToHerd;

    /* add new female calves at beginning of array and apply culling rate */
    young.unshift(newFemaleCalves * pow(1 - yc, 1 / ac));

    /* calculate cows per lactation */
    vars.lac = [];
    for (var c = 0, cs = cows.length; c < cs; c++) {
      if (!vars.lac[cows[c].lac - 1]) 
        vars.lac[cows[c].lac - 1] = 0;
      vars.lac[cows[c].lac - 1] += cows[c].no;
    }  

    var lacSum = 0;
    /* calculate avg. lactation */
    for (var l = 0, ls = vars.lac.length; l < ls; l++) {
      lacSum += vars.lac[l] * (l + 1);
    }

    /* debug max. lac 20 */
    for (var l = 0; l < 20; l++) {
      if (!vars.sim[l])
        vars.sim[l] = [];
      var no = vars.lac[l];
      vars.sim[l].push(no ? no : 0);
    }

    if ((its > IT_MIN && round(vars.noCows) === hs && Math.round(avg_lac * 1e6) === round(lacSum / vars.noCows * 1e6)) 
      || its > IT_MAX || round(vars.noCows) === 0 || isNaN(vars.noCows)) {
      converged = true;
    }

    var avg_lac = lacSum / vars.noCows;
    its++;

  } /* simulation loop */

  var herd = {
      cowsPerLac: []
    , cows: []
    , sim: vars.sim
    , heifersBought: round(vars.heifersBought[0])
    , heifersSold: round(vars.heifersSold[0])
    , young: []
  };

  /* add young stock */
  for (var i = 0, is = vars.young.length; i < is; i++)
    herd.young.push({ age: i + 1, no: round(vars.young[i]) });

  /* we need only cows of parity 1, 2 or >2. Code below as option? */
  // var sum = 0;
  // for (var l = 0, ls = vars.lac.length; l < ls; l++) {
  //   if (sum === hs)
  //     break;
  //   if (sum + ceil(vars.lac[l]) > hs)
  //     herd.cowsPerLac[l] = hs - sum;
  //   else  
  //     herd.cowsPerLac[l] = ceil(vars.lac[l]);
  //   sum += herd.cowsPerLac[l]; 
  // }

  herd.cowsPerLac[0] = round(vars.lac[0]);
  herd.cowsPerLac[1] = round(vars.lac[1]);
  herd.cowsPerLac[2] = hs - (herd.cowsPerLac[0] + herd.cowsPerLac[1]);

  for (var l = 0, ls = herd.cowsPerLac.length; l < ls; l++) {
    
    var DPP_increment = ci * 30.5 / ((herd.cowsPerLac[l] === 1) ? Math.random() * ci : herd.cowsPerLac[l]);
    var DPP = DPP_increment * 0.5;
    
    for (var c = 0, cs = herd.cowsPerLac[l]; c < cs; c++) {
    
      herd.cows.push({
          DPP: round(DPP)
        , isDry: (DPP > 30.5 * (ci - dp)) ? true : false  
        , DIM: (DPP > 30.5 * (ci - dp)) ? 0 : round(DPP)  
        , DG: (DPP - 30.5 * (ci - gp) > 0) ? round(DPP - 30.5 * (ci - gp)) : 0 
        , AGE: round(ac + l * ci + DPP / 30.5) 
        , AGE_days: round((ac + l * ci) * 30.5 + DPP) 
        , P: l + 1
      });

      DPP += DPP_increment;

    }

  }

  return herd;

};

return {
  get: get
};

}());


/*
  Feed intake of cows and young stock is predicted according to the French fill value system described in Agabriel (2010).

  The general functional principal of the INRA fill value system is as follows: The sum of all fill values of the feeds
  equals the intake capacity of the animal. While the intake capacity of the animals is based on animal-related
  parameters, the fill values of the feeds are based on feed-related parameters.

  Although not mentioned in Delagarde et al. (2011), we assume that the feed intake restrictions that apply for
  grazing dairy cows also apply for grazing heifers, because they are based on non-nutritional factors linked to sward
  availability and grazing management, not on nutritional factors linked to animal characteristics.

  The prediction of feed intake at grazing uses a simplified GrazeIn algorithm.

  GrazeMore, "Improving sustainability of milk production systems in the European Union through increasing reliance on
  grazed pasture" was an EU research project that ran from 2000-2004. It involved the development of a grazing decision
  support system to assist farmers in improving the use of grazed grass for milk production. In order to build the DSS,
  a European herbage growth prediction model and a European herbage intake prediction model were produced. Therefore
  GrazeIn is the only currently available intake prediction for grazing cows that is based on European data.

  The feed intake prediction in GrazeIn is based on the French INRA fill unit system and adapted to grazing dairy cows.
  The authors argue that because European cows don´t graze all year long and are often supplemented, a general model of
  intake is needed rather than one specialized on indoor feeding or grazing.

  Because GrazeIn in based on the INRA fill value system, in some cases equations from Agabriel (2010) are used.

  Fill values (FV) for cows are expressed in the unit LFU, lactating fill unit (UEL, unite encombrement lait) and CFU,
  cattle fill unit (UEB, unite encombrement bovin) for young stock.

  REFERENCES

  Faverdin, P., Baratte, C., Delagarde, R. and Peyraud, J.L. 2011. GrazeIn: a model of herbage intake and milk production
  for grazing dairy cows. 1. Prediction of intake capacity, voluntary intake and milk production during lactation. Grass
  and Forage Science 66(1):29-44.

  Delagarde, R., Faverdin, P., Baratte, C. and Peyraud, J.L. 2011a. GrazeIn: A model of herbage intake and milk production
  for grazing dairy cows. 2. Prediction of intake under rotational and continuously stocked grazing management. Grass and
  Forage Science 66(1):45–60.

  Agabriel, J. (2010). Alimentation des bovins, ovins et caprins. Besoins des animaux - Valeurs des aliments. Tables INRA
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

  TODO

  - PLPOT in IC and GSR: is it zero for dry cows or still PLPOT?
*/
 
var dairy = dairy || {};

dairy.intake = (function () {

var exp = Math.exp
  , log = Math.log
  , pow = Math.pow
  , min = Math.min
  , Σ = function (a) {
      var sum = 0;
      for (var i = 0, is = a[0].length; i < is; i++)
        sum += a[0][i] * a[1][i];
      return sum;
    }
  ;

function is_null_or_undefined (x) {
  return x === null || x === undefined;
}


/*
  TODO: Funktion rätselhaft, da DMI = Fs + Cs + HI_g

  DMI   [kg]  dry matter intake
  Fs    [kg]  array of feeds
  FVs_f [LFU] array of forage fill values
  Cs    [kg]  array of concentrates
  Cs_f  [LFU] array of concentrate fill values
  FV_h  [LFU] herbage fill value 
  HI_r  [-]   relative herbage intake (0-1)
  HI_g  [kg]  herbage intake at grazing
*/

var DMI = function (Fs, FVs_f, Cs, FVs_c, FV_h, HI_r, HI_g) {

  var DMI = 0
    , DMI_f = Σ([Fs, FVs_f])
    , DMI_c = Σ([Cs, FVs_c])
    ;

  DMI = DMI_f + DMI_c + (FV_h/HI_r * HI_g);

  return DMI;

};

/*
  Agabriel (2010), eqs. 2.3 & 4.5

  Equation to calculate the intake capacity.
  
  The intake capacity of the cow is not calculated acc. to Faverdin et al. (2011), because the appearance of MPprot
  (potential milk production modified by protein intake) is problematic since protein intake is unkown at the time of
  feed intake prediction. Instead, the previous Agabriel (2010) version is used:

  In GrazeIn, Pl_pot represents the potential milk yield of a cow, not the actual milk yield. This is done in order
  to avoid milk yield driving feed intake (pull-situation). In SOLID-DSS, values for milk yield are taken from the
  lactation curves modelled within the herd model. These lactation curves are based on input by the user, and thereby
  represent average milk yields instead of actual ones, so they can be interpreted as a potential under the given
  circumstances.

  IC    [LFU or CFU]  intake capacity ~ DMI @ FV = 1
  BW    [kg]          body weight
  PLPOT [kg day-1]    milk yield, potential
  BCS   [-]           body condition score (1-5)
  WL    [week]        week of lactation
  WG    [week]        week of gestation (0-40)
  AGE   [month]       age in month
  p     [#]           parity
*/

var IC = function (BW, PLPOT, BCS, WL, WG, AGE, p) {

  var IC = 0;

  if (p > 0) { /* cows */

    IC = (13.9 + (BW - 600) * 0.015 + PLPOT * 0.15 + (3 - BCS) * 1.5) * IL(p, WL) * IG(WG) * IM(AGE);
  
  } else if (p === 0) { /* young stock */

    if (BW <= 150)
      IC = 0.039 * pow(BW, 0.9) + 0.2;
    else if (150 < BW <= 290)
      IC = 0.039 * pow(BW, 0.9) + 0.1;
    else
      IC = 0.039 * pow(BW, 0.9);

  }

  return IC;

}; 

/*
  Agabriel (2010) eq. 2.3f

  The equation for the index of lactation. .

  IL  [-]     index lactation (0-1)
  p   [#]     parity
  WL  [week]  week of lactation
*/

var IL = function IL(p, WL) {

  /* if cow is dry IL = 1 */
  var IL = 1;

  if (p === 1 && WL > 0)
    IL = 0.6 + (1 - 0.6) * (1 - exp(-0.16 * WL));
  else if (p > 1 && WL > 0)
    IL = 0.7 + (1 - 0.7) * (1 - exp(-0.16 * WL));

  return IL;

};

/*
  Agabriel (2010) eq. 2.3f

  The equation for the index of gestation.
  
  IG  [-]     index gestation (0-1)
  WG  [week]  week of gestation (0-40)
*/

var IG = function (WG) {

  return 0.8 + 0.2 * (1 - exp(-0.25 * (40 - WG)));  

};

/*
  Agabriel (2010) eq. 2.3f

  The equation for the index of maturity.
  
  IM  [-]     index maturity (0-1)
  AGE [month] month
*/

var IM = function (AGE) {

  return -0.1 + 1.1 * (1 - exp(-0.08 * AGE));

};

/*
  Agabriel (2010), Table 8.1.

  The general equation for calculating forage fill values.

  The QIL and QIB values are calculated in feed.evaluation, details see there.
  
  FV_f  [LFU or CFU kg-1 (DM)] forage fill value (is LFU for cows and CFU for young stock)
  QIX   [g kg-1]               ingestibility in g per kg metabolic live weight (is QIL for cows and QIB for young stock)               
  p     [#]                    parity
*/

var FV_f = function (QIX, p) {

  if (p > 0) /* cows */
    return 140 / QIX;
  else       /* young stock */
    return 95 / QIX

};

/*
  Faverdin et al. (2011) eq. 11
  
  Equation for calculating concentrate fill value.

  One of the factors influencing the concentrate fill value is the fill value of the forage base.
  Because the total diet is unknown prior to the allocation of feeds, the weighted mean of the FV of all available
  forages for the group of cows and the time period in question is used for FV_fr.

  FV_c  [LFU or CFU kg-1 (DM)] concentrate fill value (lactating fill unit, unite encombrement lait)
  FV_fs [LFU]                  weighted FV of forages in ration
  GSR   [-]                    global substitution rate (0-1)
*/

var FV_c = function (FV_fs, GSR) {

  return FV_fs * GSR;

};

/*
  Equation to estimate the fill value of forages in a diet from the cow's requirements prior to ration optimization.
  This is based on the fact that on average a feed's fill value will descrease with increasing energy content. The 
  estimated FV_fs is used to calculate a concentrate fill value (see FV_cs). We need it if we what to keep the diet LP 
  linear.
  The regression was calculated from all forages available in Agabriel 2010. Details and R script in ../doc/FV_f.

  FV_fs_diet  [LFU or CFU kg-1 (DM)] Estimated fill value of forages in diet
  E_fs        [UFL]           Total energy content of forages in diet
  FV_fs       [LFU]           Total fill values of forages in diet
  p           [#]             parity
*/

var FV_fs_diet = function (E_fs, FV_fs, p) {

  if (p > 0)
    return -0.489 * E_fs / FV_fs + 1.433;
  else
    return -0.783 * E_fs / FV_fs + 1.688;

};

/*
  Estimate an average concentrate fill value. We assume that requirements are met i.e. cows with BWC >= 0 have a zero
  energy balance. 

  TODO: 
    - simplify to an equation?
    - use this as a better estimate of DMI instead of DMI = IC (FV ~ 1)?

  FV_cs_diet  [LFU kg-1 (DM)] estimated fill value of concentrates in diet
  E_req       [UFL]           Energy requirements of a cow (in UFL!)
  IC          [LFU]           Intake capacity of a cow
  c_mx        [kg kg-1]       Maximum fraction (DM) of concentrates in diet (optional, defaults to 0.5 which is the 
                              range the INRA system is applicable)
  PLPOT       [kg day-1]      milk yield, potential
  p           [#]             parity
  BWC         [kg]            body weight change       
*/

var FV_cs_diet = function (E_req, IC, c_mx, PLPOT, p, BWC) {

  var FV_cs_diet = 0;

  if (is_null_or_undefined(c_mx) || c_mx > 0.5)
    c_mx = 0.5;
      
  var c = 0       /* fraction of conc. in diet [kg (DM) kg-1 (DM)] */
    , c_kg = 0    /* kg conc. in diet */
    , E_f = E_req /* energy requirements covered by forage */
    , IC_f = IC   /* IC covered by forage */
    , c_fvs = []  /* store conc. fill values */
    , c_fv = 0    /* estimated conc. fill value */
    , f_fv = 0    /* estimated forage fill value */
    , s = 0       /* substitution rate */
    ;

  /* fixed to a max. UFL / UEL value observed in feeds */
  if (E_f / IC_f > 1.15)
    E_f = E_req = IC_f * 1.15;  

  while (true) {

    /* staring from a diet with zero kg conc. we add conc. till we reach c_mx */
    f_fv = FV_fs_diet(E_f, IC_f, p);
    s = GSR(c_kg, DEF(E_f, IC_f), PLPOT, p, BWC, f_fv);
    c_fv = f_fv * s;
    c = c_kg / (IC_f / f_fv + c_kg);

    if (c >= c_mx)
      break;

    c_fvs.push(c_fv);

    /* add concentrate to the diet */
    c_kg += 0.5;
    /* we assume the concentrate's UFL content is 1.05. In fact the result is not very sensitive to UFL of conc. */
    E_f = E_req - c_kg * 1.05;
    IC_f = IC - c_kg * c_fv;

  }

  /* average */
  FV_cs_diet = c_fvs.reduce(function (a, b, i, array) { return a + b / array.length; }, 0);

  return FV_cs_diet;

};

/*
  Agabriel (2010) eq. 2.25

  DEF is the average energy density of the forages in the diet, which is calculated as the weighted mean of all
  available forages for the group of cows and the time period in question.

  DEF     [UFL LFU-1 or CFU-1]    average energy density of the forages in the diet (can be slightly higher than 1)
  UFL_fs  [UFL kg-1 (DM)]         sum of the energy contents of all available forages
  FV_fs   [LFU or CFU kg-1 (DM)]  sum of the fill values of all available forages
*/

var DEF = function (UFL_fs, FV_fs) {

  return UFL_fs / FV_fs;

};

/*
  Agabriel (2010) eq. 2.26 &  Table 1.2

  Both in Agabriel (2010) and in GrazeIn, concentrate fill values not only vary with the fill value of the forage base,
  but also with the amount of concentrates, the milk yield of the cow and the energy balance of the cow, which are
  all incorporated into the calculation of the global substitution rate (GSR). Consequently, concentrate fill values
  and feed intake are calcalated iteratively until the system converges.
  In SOLID-DSS, no iterative calculation is possible because all fill values must stay constant when the linear
  programming starts to allocate feeds. Therefore the simplified version of calculating GSR that can be found in
  Agabriel (2010) was chosen. According to this version, there is one calculation fo GSR when cows are not mobilizing,
  and a different calculation when cows are mobilizing.

  For QI_c, the maximum of concentrates the user is willing to feed is used, because we assume that those cows that are
  mobilizing will receive the maximum concentrate supplementation.
  
  For dairy heifers, the global substitution rate also depends on the fill value of the forage base. Agabriel (2010)
  doesn´t supply equations for calculating GSR, but gives a Table (1.2) with discrete values. Based on these values, a
  linear regression for the calculation of GSR was produced which is valid for fill values of the forage base between
  0.95 and 1.4 and which assumes a concentrate proportion of 15%. The coefficient of determination of the linear
  regression is 0.99.

  TODO: replace BWC with something like "energy balance of the cow is negative"

  GSR   [-]                   global substitution rate (0-1)
  QI_c  [kg (DM)]             total amount of concentrates that are fed
  DEF   [UFL LFU-1 or CFU-1]  average energy density of the forages in the diet (can be slightly higher than 1)
  PLPOT [kg day-1]            milk yield, potential
  p     [#]                   parity
  BWC   [kg]                  body weight change
  FVF   [CFU kg-1]            forage fill value in diet (only needed if p = 0 i.e. youg stock)          
*/

var GSR = function (QI_c, DEF, PLPOT, p, BWC, FVF) {

  var GSR = 1
    , GSR_zero = 0.55
    , d = (p > 1 ? 1.10 : 0.96)
    ;

  if (p === 0 && !is_null_or_undefined(FVF)) { /* young stock */

    GSR = 1.765 - 1.318 * FVF;

  } else { /* cows */

    /* should be larger 0 (dry cows have a pot. milk yield as well) */
    if (PLPOT <= 0)
      PLPOT = 1;

    GSR_zero = d * pow(PLPOT, -0.62) * exp(1.32 * DEF);

    if (BWC < 0) /* energy balance of the cow is negative, irrespective of the reason */
      GSR = -0.43 + 1.82 * GSR_zero + 0.035 * QI_c - 0.00053 * PLPOT * QI_c;
    else
      GSR = GSR_zero;
  
  }

  return GSR;

};

/*
  Herbage intake prediction with GrazeIn:
  IC, FV_h -> HI_v
  H -> VI_max
  TAP, VI_max -> HI_r_tap 
  
  Continuous grazing:
  H -> HI_r_ssh
  HI_r_ssh, HI_v -> HI_g1
  HI_r_tap, HI_r_ssh, HI_v -> HI_g2
  HI_g1, HI_g2 -> HI_g


  Rotational grazing:
  A, HM_2, HGR, RT, NCow -> HA_2
  HA_2, HI_v -> HA_r -> HI_r_ha
  HI_r_ha, HI_v -> HI_g1
  HI_r_tap, HI_r_ha, HI_v -> HI_g2
  HI_g1, HI_g2 -> HI_g
*/


/*
  HI_rg [kg (DM) day-1] herbage intake when grazing is rotational
  IC    [LFU or CFU]    intake capacity ~ DMI @ FV = 1
  FV_h  [LFU]           fill value herbage
  A     [m2]            total area of paddock
  H     [cm]            sward surface height
  HM_2  [kg (DM) ha-1]  pre-grazing herbage mass above 2 cm ground level
  HGR   [kg (DM) ha-1]  daily herbage growth rate
  RT    [day]           residence time in the paddock
  NCow  [#]             number of cows in the herds
  TAP   [h day-1]       time at pasture
*/
 
var HI_rg = function (IC, FV_h, A, H, HM_2, HGR, RT, NCow, TAP) {

  var HI_v_ = HI_v(IC, FV_h)
    , HA_2_ = HA_2(A, HM_2, HGR, RT, NCow)
    , HA_r_ = HA_r(HA_2_, HI_v_)
    , HI_r_ha_ = HI_r_ha(HA_r_)
    , VI_max_ = VI_max(H)
    , HI_r_tap_ = HI_r_tap(TAP, VI_max_)
    , HI_g1_ = HI_g1(HI_v_, HI_r_ha_)
    , HI_g2_ = HI_g2(HI_v_, HI_r_tap_, HI_r_ha_, TAP)
    ;

  return HI_g(HI_g1_, HI_g2_);

};

/*
  HI_cg [kg (DM) day-1] herbage intake when grazing is continuous
  IC    [LFU or CFU]    intake capacity ~ DMI @ FV = 1
  FV_h  [LFU]           fill value herbage
  H     [cm]            sward surface height
  TAP   [h day-1]       time at pasture 
*/
 
var HI_cg = function (IC, FV_h, H, TAP) {

  var HI_v_ = HI_v(IC, FV_h)
    , VI_max_ = VI_max(H)
    , HI_r_tap_ = HI_r_tap(TAP, VI_max_)
    , HI_r_ssh_ = HI_r_ssh(H)
    , HI_g1_ = HI_g1(HI_v_, HI_r_ssh_)
    , HI_g2_ = HI_g2(HI_v_, HI_r_tap_, HI_r_ssh_, TAP)
    ;

  return HI_g(HI_g1_, HI_g2);

};


/*
  Delagarde et al. (2011) eq. 13
  Equation for relative herbage intake limited by allowance when grazing is rotational.

  When cows are not grazing, all necessary calculations are hereby completed and the feed intake restriction is:
  IC = sum of fill values of forages and concentrates multiplied with their amount (or share in the diet)
  When cows are grazing, their herbage intake can be restricted by sward availability or by time at grazing.
  For calculating the restriction caused by sward availability, there are two different calculations, one for rotational
  and one for continuous grazing.

  HI_r_ha [-] relative herbage intake limited by herbage allowance when grazing is rotational (0-1)
  HA_r    [-] relative herbage allowance
*/
 
var HI_r_ha = function (HA_r) {

  return 1.08 * (1 - exp(-1.519 * HA_r));

};

/*
  Delagarde et al. (2011) eq. 15

  Equation for calculating herbage intake restricted by sward availability when grazing is continuous.

  HI_r_ssh  [-]   relative herbage intake limited by sward surface height when grazing is continuous (0-1)
  H         [cm]  sward surface height measured with a sward stick
*/

var HI_r_ssh = function (H) {

  return -1 + 0.5 * H - 0.233 * log(1 + exp(2 * H - 7.38)) - 0.033 * log(1 + exp(H - 11));

};

/*
  Delagarde et al. (2011) eq. 17

  Herbage intake can also be restricted by time at pasture. If this is the case, it does not matter if grazing is
  rotational or continuous.

  VI_max    [kg or LFU] maximum voluntary intake depending on available forage TODO: unit of VI_max
  H         [cm]        sward surface height
*/

var VI_max = function (H) {

  return 0.058 + 0.0062 * (H - log(1 + exp(H - 22.9)));

};

/*
  Delagarde et al. (2011) eq. 16

  Equation for relative herbage intake limited by time at pasture.
  
  HI_r_tap  [-]         relative herbage intake limited by time at pasture (0-1)
  TAP       [h day-1]   time at pasture
  VI_max    [kg or LFU] maximum voluntary intake depending on available forage TODO: unit of VI_max
*/

var HI_r_tap = function (TAP, VI_max) {

  var HI_r_tap = 1;

  if (TAP <= 20)
    HI_r_tap = (VI_max * TAP) - (VI_max - 0.008) * log(1 + exp(TAP - (0.845 / (VI_max - 0.008))));

  return min(1, HI_r_tap);

};

/*
  The theoretical, maximum intake of herbage when nothing is supplemented and there is no restriction whatsoever can be
  calculated by dividing the intake capacity with the fill value of herbage.

  HI_v  [kg (DM) day-1] voluntary herbage intake
  IC    [LFU]           intake capacity
  FV_h  [LFU]           fill value herbage
*/

var HI_v = function (IC, FV_h) {

  return IC / FV_h; 

};

/*
  Delagarde et al. (2011) eq. 14

  Equation for herbage allowance above 2 cm taken.

  In GrazeIn, the available herbage mass is defined as everything above 2 cm above ground, because it is assumed that
  cows cannot graze the 2 cm closest to the ground.

  HA_2  [kg (DM) ha-1]  herbage allowance above 2 cm
  A     [m2]            total area of paddock
  HM_2  [kg (DM) ha-1]  pre-grazing herbage mass above 2 cm ground level
  HGR   [kg (DM) ha-1]  daily herbage growth rate
  RT    [day]           residence time in the paddock
  NCow  [#]             number of cows in the herds           
*/

var HA_2 = function (A, HM_2, HGR, RT, NCow) {

  return A * (HM_2 + (0.5 * HGR * RT)) / (1e4 * RT * NCow);

};

/*
  Delagarde et al. (2011) eq. 12

  Equation for relative herbage allowance taken.

  The relative herhage allowance can be calculated by dividing the available herbage mass above 2 cm above ground with
  the voluntary herbage intake of the cow.

  HA_r  [-]             relative herbage allowance
  HA_2  [kg (DM) ha-1]  herbage allowance above 2 cm
  HI_v  [kg (DM) day-1] voluntary herbage intake
*/

var HA_r = function (HA_2, HI_v) {

  return  HA_2 / HI_v;

};

/*
  Delagarde et al. (2011) eqs. 22,24

  HI_g1   [kg (DM)] intake from grazing (limited by availability)
  HI_v    [kg (DM)] voluntary herbage intake
  HI_r    [-]       HI_r_ha (rotational) or HI_r_ssh (continuously)
*/

var HI_g1 = function (HI_v, HI_r) {

  return  HI_v * HI_r;

};

/*
  Delagarde et al. (2011) eqs. 23,25

  HI_g2     [kg (DM)] intake from grazing (limited by time at pasture)
  HI_v      [kg (DM)] voluntary herbage intake
  HI_r_tap  [-]       relative herbage intake limited by time at pasture (0-1)
  HI_r      [-]       HI_r_ha (rotational) or HI_r_ssh (continuously)
  TAP       [h day-1] time at pasture
*/

var HI_g2 = function (HI_v, HI_r_tap, HI_r, TAP) {

  return  HI_v * HI_r_tap * (TAP >= 20 ? HI_r : 1);

};

/*
  Delagarde et al. (2011) eq. 21

  HI_g     [kg (DM)] intake from grazing
  HI_g1    [kg (DM)] herbage intake (limited by limited by availability)
  HI_g2    [kg (DM)] herbage intake (limited by limited by time at pasture)
*/

var HI_g = function (HI_g1, HI_g2) {

  return  min(HI_g1, HI_g2);

};

return {

    DMI: DMI
  , IC: IC
  , FV_f: FV_f
  , FV_c: FV_c
  , FV_fs_diet: FV_fs_diet
  , FV_cs_diet: FV_cs_diet
  , GSR: GSR
  , DEF: DEF
  , HI_rg: HI_rg 
  , HI_cg: HI_cg 

};

}());


/*
  Calculate milk yield and solids adjusted for parity requiring estimates for parameters of Wood's lactation curve.

  REFERENCES

  Wood, P.D.P. 1980. Breed variations in the shape of the lactation curve of cattle and their implications for
  efficiency. Animal Production 31(2):133-141.

  Tyrrell, H.F. and Reid, J.T. 1965. Prediction of the energy value of cow's milk. Journal of Dairy Science 48(9):
  1215-1223.

  DLG. 2006. Schätzung der Futteraufnahme bei der Milchkuh [Estimating feed intake of dairy cows]. DLG-Information
  1/2006. DLG-Verlag, Frankfurt/Main, Germany. p. 29.

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
 
var dairy = dairy || {};

dairy.milk = (function () {

var pow = Math.pow
  , exp = Math.exp
  ;

function is_null_or_undefined (x) {
  return x === null || x === undefined;
}

/* 
  DLG (1/2006), Tabelle 7
  
  Typical lactation milk yield data per yield level [day, milk yield]. May be used to estimate Wood's lactation curve 
  parameters (e.g. with lmfit).
*/
var data = {
  '6500': [
    [20 , 29],
    [40 , 30],
    [60 , 28],
    [100, 25],
    [150, 22],
    [200, 19],
    [250, 15],
    [300, 13],
    [350, 12]
  ],
  '7500': [
    [20 , 32],
    [40 , 33],
    [60 , 32],
    [100, 29],
    [150, 26],
    [200, 22],
    [250, 18],
    [300, 15],
    [350, 13]
  ],
  '8500': [
    [20 , 36],
    [40 , 37],
    [60 , 36],
    [100, 32],
    [150, 28],
    [200, 25],
    [250, 21],
    [300, 17],
    [350, 15]
  ],
  '9500': [
    [20 , 39],
    [40 , 40],
    [60 , 39],
    [100, 36],
    [150, 32],
    [200, 28],
    [250, 24],
    [300, 19],
    [350, 16]
  ],
  '10500': [
    [20 , 42],
    [40 , 44],
    [60 , 43],
    [100, 39],
    [150, 35],
    [200, 31],
    [250, 27],
    [300, 21],
    [350, 18]
  ],
  '11500': [
    [20 , 45],
    [40 , 48],
    [60 , 47],
    [100, 43],
    [150, 38],
    [200, 35],
    [250, 30],
    [300, 24],
    [350, 21]
  ]
};

/*
  Wood (1980)

  Prediction of milk yield adjusted for parity. Parameter adjustment (b & c) from p.137, table 4.

  Milk production potential (a parameter per parity) is scaled proportionally subject to the cow's size at calving (BW_c / MBW).

  milk  [kg]      Milk yield in week n
  a     [-]       Scale factor 
  b     [-]       Shape constant
  c     [-]       Shape constant
  n     [week]    Week of lactation
  p     [#]       Parity, defaults to parity > 2
  BW_c  [kg]      Actual body weight at calving
  MBW   [kg]      Mature body weight
*/

var milk = function (a, b, c, n, p, BW_c, MBW) {

  var milk = 0;

  if (p === 1)
    milk = BW_c / MBW * a * pow(n, b - 0.0374) * exp((c + 0.0092) * n);
  else if (p === 2)
    milk = BW_c / MBW * a * pow(n, b - 0.0253) * exp((c + 0.0000) * n);
  else /* defaults to parity > 2 */
    milk = a * pow(n, b + 0.0460) * exp((c - 0.0052) * n);

  return milk; 

};

/*
  Calculate Wood a parameter for fat.

  We don't want to mess around with integrating incomplete gamma functions. Therefore we approximate with a numeric
  integration and calculate the a parameter from 

    fat_average = a * (integrate pow(n, b) * exp(c * n) for n from 0 to 305/7) / 305/7
    a = fat_average / ((integrate pow(n, b) * exp(c * n) for n from 0 to 305/7) / 305/7)

  If we calculate a here we only need % fat as an input parameter which is usually available.

  fat_a   [%]     Wood fat scale parameter
  fat_avg [%]     fat average
  p       [#]     Parity, defaults to parity > 2
  n_mx    [week]  Week of maximum milk yield
*/

var fat_a = function (fat_avg, p, n_mx) {

  return fat_avg / fat_avg_305(1, p, n_mx);

};

/*
  Calculate Wood a parameter for protein.

  We don't want to mess around with integrating incomplete gamma functions. Therefore we approximate with a numeric
  integration and calculate the a parameter from 

    protein_average = a * (integrate pow(n, b) * exp(c * n) for n from 0 to 305/7) / 305/7
    a = protein_average / ((integrate pow(n, b) * exp(c * n) for n from 0 to 305/7) / 305/7)

  If we calculate a here we only need % protein as an input parameter which is usually available.

  protein_a   [%]     Wood protein scale parameter
  protein_avg [%]     protein average
  p           [#]     Parity, defaults to parity > 2
  n_mx        [week]  Week of maximum milk yield
*/

var protein_a = function (protein_avg, p, n_mx) {

  return protein_avg / protein_avg_305(1, p, n_mx);

};

/*
  Wood (1980)

  Prediction of milk fat adjusted for parity. Parameter adjustment (b & c) from p.137, table 4. It is assumed that the 
  fat minimum occurs six weeks after milk yield peaks. 

  fat   [%]     Percent milk fat in week n
  a     [-]     Scale factor
  n     [week]  Week of lactation
  p     [#]     Parity, defaults to parity > 2
  n_mx  [week]  Week of maximum milk yield
*/

var fat = function (a, n, p, n_mx) {

  var fat = 0
    , b = -0.1230 /* shape constant */
    , c = 0.0104  /* shape constant */
    ;  

  if (p === 1)
    b += 0.0168;
  else if (p === 2)
    b += 0.0320;
  else /* defaults to parity > 2 */
    b += -0.0078;

  /* adjust for week of milk peak */
  c = -(b / (4 + n_mx));
  b = -((6 + n_mx) * c);

  fat = a * pow(n, b) * exp(c * n);

  return fat; 

};

/*
  Wood (1980)

  Prediction of milk protein adjusted for parity. Parameter adjustment (b & c) from p.137, table 4. It is assumed that 
  the protein minimum occurs six weeks after milk yield peaks. 

  protein [%]     Percent milk protein in week n
  a       [-]     Scale factor
  n       [week]  Week of lactation
  p       [#]     Parity, defaults to parity > 2
  n_mx    [week]  Week of maximum milk yield
*/

var protein = function (a, n, p, n_mx) {

  var protein = 0
    , b = -0.1274 /* shape constant */
    , c = 0.0107  /* shape constant */
    ;

  if (p === 1)
    b += 0.0200;
  else if (p === 2)
    b += 0.0025;
  else /* defaults to parity > 2 */
    b += -0.0136;

  /* adjust for week of milk peak */
  c = -(b / (4 + n_mx));
  b = -((6 + n_mx) * c);

  protein = a * pow(n, b) * exp(c * n);

  return protein; 

};

/*
  Wood (1980)

  Day of maximum milk yield: x/dx (a * x^(b-1) * exp(c * x) * (b + c*x)) = 0 -> -b/c

  d_mx  [day]   day max milk 
  b     [-]     Shape constant
  c     [-]     Shape constant
  p     [#]     Parity, defaults to parity > 2

*/

var d_mx = function (b, c, p) {

  /* in weeks */
  var n_mx = 0;

  if (p === 1)
    n_mx = -((b - 0.0374) / (c + 0.0092));
  else if (p === 2)
    n_mx = -((b - 0.0253) / (c + 0.0000));
  else /* defaults to parity > 2 */
    n_mx = -((b + 0.0460) / (c - 0.0052));

  return n_mx * 7; 

};

/*
  305 days milk yield.

  milk_305  [kg]      Total milk yield in 305 days
  a         [-]       Scale factor 
  b         [-]       Shape constant
  c         [-]       Shape constant
  p         [#]       Parity, defaults to parity > 2
  BW_c      [kg]      Actual body weight at calving
  MBW       [kg]      Mature body weight
*/

var milk_305 = function (a, b, c, p, BW_c, MBW) {

  var milk_305 = 0;

  for (var day = 1; day < 306; day++)
    milk_305 += milk(a, b, c, day / 7, p, BW_c, MBW);

  return milk_305;

};

/*
  Average 305 days milk fat percent.

  fat_avg_305 [%]     Average fat yield
  a           [-]     Scale factor
  p           [#]     Parity, defaults to parity > 2
  n_mx        [week]  Week of maximum milk yield
*/

var fat_avg_305 = function (a, p, n_mx) {

  var fat_avg_305 = 0;

  for (var day = 1; day < 306; day++)
     fat_avg_305 += fat(a, day / 7, p, n_mx);

  return fat_avg_305 / 305;

};

/*
  Average 305 days milk protein percent.

  protein_avg_305 [%]     Average protein yield
  a               [-]     Scale factor
  p               [#]     Parity, defaults to parity > 2
  n_mx            [week]  Week of maximum milk yield
*/

var protein_avg_305 = function (a, p, n_mx) {

  var protein_avg_305 = 0;

  for (var day = 1; day < 306; day++)
     protein_avg_305 += protein(a, day / 7, p, n_mx);

  return protein_avg_305 / 305;

};

/*
  Tyrrell (1965)

  Energy corrected milk. Corrected to F_target and P_target.

  ECM       [kg]  Energy corrected milk
  F_target  [%]   ECM fat target  
  P_target  [%]   ECM protein target
  F         [%]   Fat in milk
  P         [%]   Protein in milk
  M         [kg]  Milk
*/

var ECM = function (F_target, P_target, F, P, M) {
  
  /* E [kcal lb-1] energy of one lb milk, Table 4, eq. 2 */
  var E_target = 40.72 * F_target + 22.65 * P_target + 102.77
    , E = 40.72 * F + 22.65 * P + 102.77
    ;

  var ECM =  M * E / E_target;

  return ECM;

};

return {
    milk: milk
  , fat: fat
  , fat_a: fat_a
  , protein: protein
  , protein_a: protein_a
  , d_mx: d_mx
  , milk_305: milk_305
  , fat_avg_305: fat_avg_305
  , protein_avg_305: protein_avg_305
  , ECM: ECM
  , data: data
};

}());


/*
  Energy and protein requirements according to a selection of evaluation systems (DE, FI, GB, FR).

  REFERENCES
  
  AFRC (Agricultural Food and Research Council). 1993. Energy and protein requirements of ruminants. An advisory
  manual prepared by the AFRC Technical Committee on Responses to Nutrients. CAB International, Wallingford, UK.
  
  Agabriel, J. 2010. Alimentation des bovins, ovins et caprins. Besoins des animaux - Valeurs des aliments. Tables INRA
  2010. Editions Quae, France.
  
  Dong, L.F., Yan, T., Ferris, C.P. and McDowell, D.A. 2014. Comparison of energy utilisation and energetic efficiency
  of dairy cows under different input systems. In: Proceedings of the 65th Conference of European Association of
  Animal Production. p. 395, Copenhagen, Denmark.
  
  Feed into Milk Consortium. 2004. Feed into Milk. A new applied feeding system for dairy cows. An advisory manual.
  Ed. Thomas, C. Nottingham University Press, UK.
  
  GfE [Society of Nutrition Physiology] 2001. Empfehlungen zur Energie- und Nährstoffversorgung der Milchkühe und
  Aufzuchtrinder [Recommendations on the energy and nutrient supply for dairy cows and heifers]. DLG-Verlag, Frankfurt/
  Main, Germany.
  
  Jarrige, R. 1989. Ruminant nutrition: recommended allowances and feed tables. John Libbey Eurotext, France.
  
  MTT. 2006. Rehutaulukot ja ruokintasuositukset [Feed tables and feeding recommendations]. Agrifood Research Finland,
  Jokioninen, Finland.
  
  MTT 2014. Rehutaulukot ja ruokintasuositukset [Feed tables and feeding recommendations] [online]. Agrifood
  Research Finland, Jokioinen. Accessed last on November 20, 2014, available at:
  https://portal.mtt.fi/portal/page/portal/Rehutaulukot/feed_tables_english

  NRC (National Research Council). 2001. Nutrient requirements of dairy cattle. 7th edition. National Academy Press,
  Washington, D.C. USA.

  Sjaunja, L.-O., Baevre, L., Junkarinen, L., Pedersen, J. and Setala, J. 1990. A Nordic proposal for an energy corrected
  milk (ECM) formula. In: in Proceedings of the 27th Biennial Session of the International Committee for Animal Recording.
  Paris, France. p. 156-157.

  Tyrrell, H.F. and Reid, J.T. 1965. Prediction of the energy value of cow's milk. Journal of Dairy Science 48(9):
  1215-1223.

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

var dairy = dairy || {};

dairy.requirements = (function () {

var log = Math.log
  , LN10 = Math.LN10
  , exp = Math.exp
  , pow = Math.pow
  , log10 = function (x) { 
      return log(x) / LN10; 
    }
  , WEEKS_IN_MONTH = 30.5 / 7
  , WEEKS_GESTATION_PERIOD = 40
  ;

function is_null_or_undefined (x) {
  return x === null || x === undefined;
}

/*
  NRC (2001) p. 18 ff, AFRC (1993) p. 159

  Adjustment of maintenance requirements for energy needed for grazing activity:

  In comparison to cows housed indoors, cows that are grazing have a higher energy requirement for maintenance. The
  increase is a function of the distance walked, the topography of the pasture, and the body weight of the cow.
  Of the feed evaluation systems of Germany, France, UK and Finland, both the French and the British system offer a
  simple activity-related addition to the energy requirements for maintenance. Because SOLID-DSS will deal with a lot
  of grazing cows, the more detailed energy addition for grazing offered by the NRC was chosen.

  Energy requirement for maintenance when grazing =
      Basic maintenance requirement
    + extra requirement for walking
    + extra requirement for grazing
    + extra requirement for hilly pastures

  Regarding the extra requirement for hilly pastures, we chose to use the original version by AFRC (1993) that NRC is
  quoting on page 21, because it can cover differing slopes.

  NRC (2001) expresses the basic maintenance requirements of dairy heifers in Mcal NEM, but the extra requirements are
  calculated using the same equations as for the dairy cows, which are expressed in Mcal NEL. Because the NRC (2001)
  assumes that NEL and NEM are equivalent (in this case), both the basic maintenance requirements and all additions will
  be calculated as described by the NRC, and then the sum of all additions will be expressed in % of the basic
  requirement. So the output of this calculation is the addition in %, which is then used in the national requirements
  to upscale the energy requirements for maintenance accordingly.

  activity  [ME ME-1] additional maintenance requirements as fraction of total requirements
  BW        [kg]      body weight
  f         [kg kg-1] fraction pasture in diet 
  d         [km]      distance between barn and pasture
  d_v       [m]       vertical distance between barn and pasture or on pasture  
*/

var activity = function (BW, f, d, d_v) {

  var SBW = BW * 0.96 /* shrunk body weight (equation taken from NRC (2001) p. 234) */
    , maintenance = 0.08 * pow(SBW, 0.75)
    , walking = 0.00045 * BW * d
    , grazing = 0.002 * BW * f
    , hilly = 0.00003 * BW * d_v * 4
    ;

  return (walking + grazing + hilly) / maintenance;

};

/*
  GfE (2001)
  
  Nutrient requirements of dairy cows and young stock according to GfE.

  cows

  Energy is expressed in MJ NEL (net energy lactation) and protein is expressed in uCP (utilizable crude protein at the
  duodenum, the German abbreviation is nXP).

  Because DMI is predicted according to GrazeIn, the unit of IC (intake capacity) is UEL. For calculating the German
  protein requirements, IC is used as if it was expressed in kg, which means that an average fill value of 1 is assumed.

  young stock

  Energy is expressed in MJ ME (metabolizable energy) and protein is expressed in g uCP (utilizable crude protein at the
  duodenum, the German abbreviation is nXP).

  Because DMI is predicted according to GrazeIn, the unit of IC (intake capacity) is UEB. For calculating the German
  protein requirements, IC is used as if it was expressed in kg, which means that an average fill value of 1 is assumed.
*/

var de = (function () {

  /*
    maintenance [{NEL or ME, uCP}]  Adjusted for share of forages in diet (by AFBI) if p > 0
    BW          [kg]                Body weight
    DMI         [kg]                Dry matter intake (if unknow assume IC ~ DMI @ FV = 1)
    f           [kg (DM) kg-1 (DM)] Share of forage in diet
    p           [#]                 parity
  */

  var maintenance = function (BW, DMI, f, p) {

    if (p > 0) { /* cows */
      /*
        Dong et. al. (2014)

        The equation for the energy requirements for maintenance was formulated using a regression method (feeding at
        different energy levels and extrapolating to an energy balance of zero). (eq. 1.4.1)

        Energy requirements for maintenance are adjusted to forage proportion based on results from SOLID Task 3.3,
        conducted by AFBI:

        AFBI derived estimates of energy utilization by dairy cows on high forage diets. Using a database of calorimetric
        chamber experiments, the effects of total energy intake and diet quality forage proportion and contents of energy,
        protein and fibre on the energy requirements for maintenance and on the efficiency of using energy for maintenance
        and lactation were evaluated.

        The energy requirement for maintenance was found to be influenced by forage proportion:

        forage proportion < 30% -->   ME_m, MJ british = 0.65 * LW^0.75 ; k_l = 0.62
        forage proportion 30%-99% --> ME_m, MJ british = 0.68 * LW^0.75 ; k_l = 0.62
        forage proportion = 100% -->  ME_m, MJ british = 0.74 * LW^0.75 ; k_l = 0.62

        No influence of forage proportion on the efficiency of using energy for milk production (k_l) was found.
        
        Within an energy evaluation system, energy evaluation and energy requirements form a unit, and energy requirements
        are a unit of maintenance requirements and k_l:
        energy system = energy evaluation + maintenance requirement + k_l

        Therefore the AFBI-results cannot be ABSOLUTELY incorporated in a system of energy evaluation and requirement
        different from the British system, and the incorporation will be in RELATIVE terms.

        The equation for protein requirements for maintenance (equations 2.1.1, 2.1.2, 2.1.3, 2.1.5) summarizes the
        endogenous N losses via urine (5.9206 * log10 BW - 6.76), feces (2.19 * DMI) and skin (0.018 * BW^0.75),
        transforms that into protein (*6.25) and then multiplies with 2.1 to get the uCP requirement. (Assuming an
        efficiency of using absorbed amino acid N of 75%, an absorbability of amino acid N of 85% and a proportion of
        amino acid N of non-ammonia-N in chyme of 73%.)
      */

      var NEL = 0.293 * pow(BW, 0.75)
        , uCP = ((5.9206 * log10(BW) - 6.76) + (2.19 * DMI) + (0.018 * pow(BW, 0.75))) * 6.25 * 2.1
        ;
   
      if (f) {
        if (f < 0.3)
          NEL = 0.280 * pow(BW, 0.75);
        else if (f >= 0.3 && f <= 0.99)
          NEL = 0.293 * pow(BW, 0.75);
        else
          NEL = 0.319 * pow(BW, 0.75);
      }

      return {
          E: NEL
        , P: uCP
      };

    } else {

      /*
        Equation for energy requirement for maintenance taken from GfE (2001) p. 27, chapter 1.5.1

        The protein requirement for maintenance is calculated with the same equations as for the dairy cows. The only
        difference is that the efficiency of using absorbed amino acid N is 70% for heifers instead of 75% for dairy cows.
        The equation (equations 2.1.1, 2.1.2, 2.1.3, 2.1.5) summarizes the endogenous N losses via urine (5.9206 *
        log10 BW - 6.76), feces (2.19 * DMI) and skin (0.018 * BW^0.75), transforms that into protein (*6.25) and then
        multiplies with 2.3 to get the uCP requirement. (Assuming an efficiency of using absorbed amino acid N of 70%, an
        absorbability of amino acid N of 85% and a proportion of amino acid N of non-ammonia-N in chyme of 73%.)
      */

      var ME = 0.530 * pow(BW, 0.75)
        , uCP = ((5.9206 * log10(BW) - 6.76) + (2.19 * DMI) + (0.018 * pow(BW, 0.75))) * 6.25 * 2.3;
        ;

      return {
          E: ME
        , P: uCP
      };

    }

  };

  /*
    GfE (2001) eqs. 1.4.3, 2.1.5

    Equation for energy requirement for milk production taken from GfE (2001) equation 1.4.3. Equation for protein 
    requirement for milk production taken from GfE (2001) equation 2.1.5.

    The multiplication with 2.1 in the protein requirement equation is again a result of assuming an efficiency of using
    absorbed amino acid N of 75%, an absorbability of amino acid N of 85% and a proportion of amino acid N of
    non-ammonia-N in chyme of 73%.

    production  [{NEL, uCP}]  
    milk        [kg]
    fat         [%]
    protein     [%]
    p           [#]           parity
  */

  var production = function (milk, fat, protein, p) {

    if (p > 0) {
    
      var NEL = milk * (0.38 * fat + 0.21 * protein + 0.95 + 0.1)
        , uCP = milk * protein * 10 * 2.1
        ;

      return {
          E: NEL
        , P: uCP
      };

    } else {
      
      return {
          E: 0
        , P: 0
      };      
    
    }

  };

  /*
    GfE (2001) eqs 1.4.5, 2.2.2, Jeroch (2008) p. 410

    cows

    Equation for energy requirement for gestation taken from GfE (2001) equation 1.4.5. Equation for protein requirement
    for gestation taken from GfE (2001) equation 2.2.2.

    The equation for energy requirements summarizes the energetic value of the developed tissue in the uterus and the
    foetus (0.044 * e^(0.0165*d)) and the developed tissue of the udder (0.8 and 1.5 MJ, respectively) and then
    multiplies with 5.71 to get the requirement. (Assuming an efficiency of using energy for gestation of 17.5%.)

    GfE recommends to link the protein requirements of dry cows not to the N requirement of the cow but to the N
    requirement of the ruminal microbes: uCP supply for dry cows should be a minimum of 1080 [g day-1] during 42-21 days
    before calving and 1170 uCP [g day-1] during the last 21 days before calving, respectively.

    young stock 

    GfE (2001) doesn´t mention additional energy and protein requirements for gestation. For energy, the recommendation
    from Jeroch (2008), who recommends adding extra energy during the last 6 weeks of gestation, was implemented.

    GfE (2001) doesn´t give information on protein requirement for gestation, rather the requirement for gestation is
    included in the requirement for body weight gain.

    gestation [{NEL or ME, uCP}]
    WG        [week]              Week of gestation (1-40)
    DIM       [day]               Days in milk (assume cow dry if zero)
    p         [#]                 parity
  */

  var gestation = function (WG, DIM, p) {

    if (p > 0) {

      var NEL = 0
        , uCP = 0
        ;

      if (WG > 0) {

        if (WEEKS_GESTATION_PERIOD - WG < 3)
          NEL = ((0.044 * exp(0.0165 * WG * 7)) + 1.5) * 5.71;
        else if (WEEKS_GESTATION_PERIOD - WG < 8)
          NEL = ((0.044 * exp(0.0165 * WG * 7)) + 0.8) * 5.71;
        else
          NEL = ((0.044 * exp(0.0165 * WG * 7)) + 0.0) * 5.71;
        
        uCP = (1.9385 * exp(0.0108 * WG * 7)) * 6.25 * 2.3;

        /* minimum recommended protein requirements for dry cows */
        if (DIM === 0) { 

          if (uCP < 1170 && WG > WEEKS_GESTATION_PERIOD - 3)
            uCP = 1170;
          else if (uCP < 1080 && WG > WEEKS_GESTATION_PERIOD - 6)
            uCP = 1080;

        }

      }
      
      return {
          E: NEL
        , P: uCP
      };

    } else {

      var ME = 0
        , uCP = 0
        ;

      if (WG > 0) {

        if (WEEKS_GESTATION_PERIOD - WG < 3)
          ME = 30;
        else if (WEEKS_GESTATION_PERIOD - WG < 6)
          ME = 20;

      }
      
      return {
          E: ME
        , P: uCP
      };

    }

  };

  /*
    GfE (2001)

    cows

    Equations for energy mobilization and weight gain taken from GfE (2001) page 22 and 23, respectively. Equation for
    protein mobilization taken from GfE (2001) chapter 2.1.1.3.
   
    The GfE does not give information in which stages of lactation mobilization and reconstitution of body reserves is
    to be expected. 80-85% of the energy content of body reserves is assumed to be used for milk production.

    Mobilization of protein at the beginning of lactation is not included in calculations. Net protein content of 1 kg
    body weight gain is assumed to be 138 g if body weight of the cow exceeds 550 kg and daily body weight gain is less
    than 500 g. Multiplication with 2.3 results from assuming an efficiency of using absorbed amino acid N of 70%, an
    absorbability of amino acid N of 85% and a proportion of amino acid N of non-ammonia-N in chyme of 73%.

    young stock

    Equation for energy requirements for body weight gain taken from GfE (2001) p. 28 equ. 1.5.1

    Information on protein requirement for body weight gain taken from GfE (2001) p. 48 and 50

    Both the energy and protein requirements for body weight gain are based on the net energy and protein retention of
    the heifer. GfE (2001) doesn´t supply equations for the calculation of energy and protein retention, but gives a
    Table (1.5.1) with discrete values depending on body weigth and body weight gain. Based on these discrete values
    from Table 1.5.1, linear regressions for the calculation of energy and protein retention were produced which are
    valid for heifers with body weights between 150 and 550 kg and body weight gains between 400 and 800 g per day, and
    which had coefficients of determination of 0.94 (energy) and 0.92 (protein).    

    TODO:
    - Die GfE gibt zwei Untergrenzen für die Proteinversorgung der Aufzuchtrinder an: die Proteinzufuhr soll 12 g XP
    MJ-1 ME nicht unterschreiten, und die Ration soll mindestens 9 % XP enthalten. Blöderweise geben sie diese
    Empfehlungen in Rohprotein an, nicht in uCP. Können wir (zum. eines davon) das trotzdem irgendwie einbauen?

    weight  [{NEL or ME, uCP}]
    BWC     [kg]                body weight change
    BW      [kg]                body weight
    p       [#]                 parity
   */

  var weight = function (BWC, BW, p) {

    if (p > 0) {

      var NEL = 0
        , uCP = 0
        ;

      if (BWC < 0) {
        NEL = BWC * 20.5;
      } else {
        NEL = BWC * 25.5;
        uCP = BWC * 317.4;
      }

      return {
          E: NEL
        , P: uCP
      };

    } else {

      var ME = 0
        , uCP = 0
          /* RE [MJ] energy retention, expressed in MJ per day */
        , RE = -10.729 + BW * 0.02059 + BWC * 17.8868
          /* RN [g] protein retention, expressed in g per day */
        , RN = 61.1959 - BW * 0.08728 + BWC * 89.8389
        ;

      ME = RE * 2.5;
      uCP = RN * 2.3;

      return {
          E: ME
        , P: uCP
      };

    }

  };

  return {
      main: maintenance
    , prod: production
    , gest: gestation
    , weit: weight
    , actv: activity
  };

}());

/*
  MTT (2014)

  cows

  Nutrient requirements of dairy cows according to the Finnish system of feed evaluation and requirements. Latest print
  version using "feed values" instead of ME, which is used now. The last description of the Finnish system of feed evaluation
  published in print is MTT (2006). Since then all updates have been published online, hereafter quoted as MTT (2014). 

  Energy is expressed in MJ ME (metabolisable energy) and protein is expressed in g MP (metabolisable protein).

  young stock

  Nutrient requirements of dairy heifers according to the Finnish system of feed evaluation and requirements.
  The latest print version still used "feed values" instead of ME, which is used now.

  Energy is expressed in MJ ME (metabolisable energy) and protein is expressed in g MP (metabolisable protein).

  MTT doesn´t mention an energy addition due to grazing for the heifers, but the NRC approach as described above will be
  used nonetheless.
*/

var fi = (function () {

  /*
    MTT (2014)

    cows

    All equations for energy requirements taken from website, chapter "Energy requirements of dairy cows".
    All equations for protein requirements taken from website, chapter "Protein requirements of dairy cows".

    young stock

    Information taken from website, chapter "Energy requirements of growing heifers".

    The MTT website provides a Table which gives the sum of the energy requirements of heifers for maintenance and
    growth. The original equations (separated into requirements for maintenance and growth) which were used to calculate
    the energy requirements were provided by Rinne (2014), who states that the equations used for young cattle ME
    requirements in Finland are based on AFRC (1990) and were modified by Mikko Tuori (University of Helsinki, 1955) and
    further by Arto Huuskonen (MTT Agrifood Research Finland, 2010).

    For the protein requirements for maintenance and growth, MTT only provides a Table for heifers smaller than 200 kg
    (see website, chapter "Protein requirements of growing cattle"). From the values in this Table, a linear regression
    for calculating protein requirements depending on body weight and body weight change was produced, which is valid
    for heifers with body weights between 100 and 200 kg and body weight gains between 0.5 and 1.6 kg per day, and which
    had a coefficient of determination of 0.99. 
    For all heifers heavier than 200 kg, protein intake is assumed to be adequate if the protein balance in the rumen
    (PBV) of the total diet is not lower than -10 g per kg feed. In SOLID-DSS, the PBV values will not be used. Instead,
    Rinne (2014) recommended to use a minimum recommendation of 90 g CP in the total diet.
    k_m (efficiency of using ME for maintenance) is assumed as 0.712.

    TODO:
  - Wie bauen wir die Mindestempfehlung von 90 g XP in der Gesamtration für die heifers > 200 kg ein?

    maintenance [{ME, MP}]          adjusted for share of forages in diet (acc. to AFBI, see explanation above)
    BW          [kg]                body weight
    DMI         [kg]                Dry matter intake (if unknow assume IC ~ DMI @ FV = 1)
    f           [kg (DM) kg-1 (DM)] share of forage in diet
    BWC         [kg]                body weight change
    type        [enum]              type of cow, dairy or dual (purpose)
    p           [#]                 parity 
  */

  var maintenance = function (BW, DMI, f, BWC, type, p) {

    if (p > 0) {

      var ME = 0.515 * pow(BW, 0.75)
        , MP = 1.8 * pow(BW, 0.75) + 14 * DMI
        ;

      if (f) {
        if (f < 0.3)
          ME = 0.492 * pow(BW, 0.75);
        else if (f >= 0.3 && f <= 0.99)
          ME = 0.515 * pow(BW, 0.75);
        else
          ME = 0.560 * pow(BW, 0.75);
      }

      return {
          E: ME
        , P: MP
      };

    } else {

      var ME = (0.53 * pow(BW / 1.08, 0.67) + 0.0071 * BW ) / 0.712
        , MP = -36.3373 + BW * 0.8879 + BWC * 247.1739
        ;

      ME = (type === 'dual') ? ME * 0.9 : ME;

      /*if (BW > 200)
        XP should be at least 90 g*/

      return {
          E: ME
        , P: MP
      };

    }

  };

  /*
    MTT (2014)

    ECM is calculated according to Sjaunja et al. (1990)

    production  [{ME, MP}]  
    milk        [kg]
    fat         [%]
    protein     [%]
    p           [#]

    TODO: there is a correction equation for energy intake!
    jv: Hm, I would argue that we do not need it if use INRA intake. Because feed interaction is covered there, isn't it?
      On the other hand that might mean that we also have to remove ME from gb maint. requirements????
  */

  var production = function (milk, fat, protein, p) {
  
    if (p > 0) {

      var ECM = milk * (383 * fat + 242 * protein + 783.2) / 3140
        , ME = 5.15 * ECM
        , MP = (1.47 - 0.0017 * ECM) * (milk * protein * 10 /* to g kg-1 */)
        ;

      return {
          E: ME
        , P: MP
      };

    } else {

      return {
          E: 0
        , P: 0
      };

    }

  };

  /*
    MTT (2014)

    According to Rinne (2014), the energy and protein requirements for young stock gestation are calculated similar to 
    the older cows.

    gestation [{ME, MP}] 
    WG        [1-40]      week of gestation
  */

  var gestation = function (WG) {

    var ME = 0
      , MP = 0
      ;

    if (WG > 0) {
      if (WG / WEEKS_IN_MONTH > 8) {
        ME = 34.0;
        MP = 205.0;
      } else if (WG / WEEKS_IN_MONTH > 7) {
        ME = 19.0;
        MP = 135.0;
      } else if (WG / WEEKS_IN_MONTH > 6) {
        ME = 11.0;
        MP = 75.0;
      }
    }
    
    return {
        E: ME
      , P: MP
    };

  };

  /*
    MTT (2014)

    young stock 

    The equation for calculating the energy requirements for weight gain is not provided on the website, but was
    supplied by Rinne (2014), details see above. k_f, the efficiency of using ME for body weight gain, is assumed as
    0.474.

    The protein requirement for body weight gain is included in the requirements for maintenance, details see above.

    weight [{ME, MP}]
    BWC    [kg]       body weight change
    BW     [kg]       body weight
    type   [enum]     type of cow, dairy or dual (purpose)
    p      [#]        parity 
  */

  var weight = function (BWC, BW, type, p) {

    if (p > 0) {

      var ME = 0
        , MP = 0
        ;

      if (BWC < 0) {
        ME = BWC * 28.0;
        MP = BWC * 138.0;
      } else {
        ME = BWC * 34.0;
        MP = BWC * 233.0;
      }

      return {
          E: ME
        , P: MP
      };

    } else {

      var ME = (((4.1 + 0.0332 * BW - 0.000009 * BW * BW) / (1 - 0.1475 * BWC)) * 1.15 * BWC) / 0.474
        , MP = 0
        ;

      ME = (type === 'dual') ? ME * 0.9 : ME;

      return {
          E: ME
        , P: MP
      };

    }

  };

  /* FOR THE SAKE OF COMPLETENESS: fi energy correction

    The Finnish nutrient requirements for dairy cows includes a correction equation for energy intake, which in SOLID-DSS
    is probably not usable, because it requires knowledge of the total diet when calculating intake. (Which in SOLID-DSS
    is calculated before diets are formulated.) However, we want to estimate feed intake according to the Finnish equation
    and correct it using their correction equation after the solver has produced the diets and then check to see how big
    the difference between the Finnish energy intake and the energy intake based on the results from the solver is.

    The last description of the Finnish system of feed evaluation published in print is MTT (2006). Since then all updates
    have been published online, quoted as MTT (2014).

    Energy values of feeds are expressed in Finnish MJ ME, details see feed.evaluation.js

    REFERENCES

    MTT 2006. Rehutaulukot ja ruokintasuositukset (Feed tables and feeding recommendations). Agrifood Research Finland,
    Jokioninen, Finland, 84 p.

    MTT 2014. Rehutaulukot ja ruokintasuositukset (Feed tables and feeding recommendations) [online]. Agrifood
    Research Finland, Jokioinen. Accessed last on November 20, 2014, available at:
    https://portal.mtt.fi/portal/page/portal/Rehutaulukot/feed_tables_english


    Estimation of feed intake according to MTT (2014)

    In Finland, feed intake of dairy cows is estimated using the energy requirements and an average diet energy
    concentration, assuming that energy supply is adequate and the cow is neither mobilizing nor reconstituting body
    reserves.

    f_intake  [kg (DM)]       Estimated feed intake, kg DM
    ME_req    [MJ ME]         Total energy requirements of a cow per day
    ME_avg    [MJ kg-1 (DM)]  Average energy concentration of the total diet
  */

  var f_intake = function (ME_req, ME_avg) {

    return ME_req / ME_avg;

  };

  /*
    Calculation of corrected energy intake according to MTT (2014)

    The Finnish feed evaluation system uses constant energy values for feeds and doesn´t take associative effects of feeds
    and effects of feeding level into account. As a remedy, the energy intake of the cow is corrected in order to consider
    effects of increased dry matter intake, high energy diets and diets with low crude protein concentration. 

    f_intake_corr [MJ ME]        Corrected energy intake
    f_intake      [kg (DM)]      Estimated feed intake, kg DM
    ME_avg        [MJ kg-1 (DM)] Average energy concentration of the total diet
    CP_avg        [g kg-1 (DM)]  Average crude protein concentration of the total diet
  */

  var f_intake_corr = function (f_intake, ME_avg, CP_avg) {

    return f_intake * ME_avg - (-56.7 + 6.99 * ME_avg + 1.621 * f_intake - 0.44595 * CP_avg + 0.00112 * CP_avg * CP_avg);
    
  };  

  return {
        main: maintenance
      , prod: production
      , gest: gestation
      , weit: weight
      , actv: activity
    };

}());

/*
  FiM (2004), AFRC (1993)

  cows

  Nutrient requirements of dairy cows according to the British system of feed evaluation and requirements.

  Energy is expressed in MJ ME (metabolisable energy) and protein is expressed in g MP (metabolisable protein). Feed
  into Milk (FiM) recommends adding a 5 % safety margin to the total energy and protein requirements. This is not 
  included in the following equations.

  young stock

  While the energy and protein requirements of the dairy cows are calculated as described in Feed into Milk (FiM 2004),
  FiM doesn´t mention heifers, therefore all information about the energy and protein requirements of dairy heifers is
  taken from AFRC (1993).

  Energy is expressed in MJ ME (metabolisable energy) and protein is expressed in g MP (metabolisable protein).

  AFRC doesn´t mention an activity addition because of grazing for the dairy heifers, but the NRC approach as described
  above will be used nonetheless.
*/

var gb = (function () {

  /*
    cows

    Instead of the original FiM equation to calculate energy requirements for maintenance, the equations produced by
    SOLID Task 3.3 (Dong et al. 2014, see above) are used. In this case, incorporating the new AFBI equations in a TOTAL
    way is appropriate, because they were developed within the British system of feed evaluation and requirements.

    Assuming an average fill value of 1, the IC (FV) value produced by GrazeIn is used instead of DMI (kg)

    young stock

    AFRC (1993) doesn´t differentiate between the energy requirements for maintenance, growth and gestation, instead
    a Table giving the total energy and protein requirements for growing heifers depending on body weight, daily weight
    gain and (for energy requirement only) energy density of the diet is supplied (Table 5.5)
    Based on the values from Table 5.5, linear regressions for calculating energy and protein requirements for
    maintenance and body weight gain depending on body weight, body weight gain and energy density of the diet were
    produced which are valid for heifers with body  weight between 100 and 600 kg and body weight gains between 0.5 and
    1.0 kg per day, and which had coefficients of determination of 0.98 (energy) and 0.99 (protein).

    Assuming an average fill value of 1, the IC (FV) value produced by GrazeIn is used instead of DMI (kg)    

    maintenance [{ME, MP}]          Adjusted for share of forages in diet (by AFBI)
    BW          [kg]                Body weight
    DMI         [kg]                Dry matter intake (if unknow assume IC ~ DMI @ FV = 1)
    ME_total    [MJ kg-1 (DM)]      Energy supply of the total diet
    f           [kg (DM) kg (DM)]   Share of forage in diet (optional)
    fat         [kg d-1]            Amount of fat supplied by the total diet
    ME_ferm     [MJ kg-1 (DM)]      Energy contribution of fermentation acids in the feeds, sum of the total diet
    BWC         [kg]                body weight change
    p           [#]                 parity
  */

  var maintenance = function (BW, DMI, ME_total, f, fat, ME_ferm, BWC, p) {

    if (p > 0) {

      /* ME_fat [MJ kg-1 (DM)] energy contribution of oils and fat in the feeds, sum of the total diet.
        If fat is not available we assume 3.5% fat in ration i.e. the average in relevant fresh forages */
      if (is_null_or_undefined(fat))
        var ME_fat = 0.035 * 35;
      else
        var ME_fat = 35 * fat;

      /* ME_ferm is the energy contribution of the fermentation acids, so this part only applies to silage. When the 
        amounts of fermentation acids are not know, an average value of 0.10 * ME is used.
        If ME_ferm is not available we assume 10% fermentation acids in silage, and 6.5 kg silage in the diet, with an
        energy content of 11.2 MJ ME */
      if (is_null_or_undefined(ME_ferm))
        ME_ferm = 6.5 /* kg (DM) silage */ * 11.2 /* ME kg-1 */ * 0.1 /* fraction of fermentation acids kg-1 */;

      var ME = 0.68 * pow(BW, 0.75)

        /*
          FiM (2004) p. 23f, NRC (2001) p. 18ff

          The equation for protein requirements for maintenance summarizes the endogenous N losses via urine (4.1 *W^0.5),
          hair and scurf (0.3 * W^0.6) and feces (metabolic fecal protein, MFP = 30 * DMI). Also an adjustment is included
          for the fraction of intestinally indigestible rumen-synthesized microbial protein that is degraded from the hind
          gut and absorbed as ammonia (0.5 * ((DMTP/0.8) - DMTP). FiM adopted these four equations from NRC (2001).

          Endogenous protein supply at the intestine is estimated to be about 15% of NAN flow, and the efficiency of
          synthesis of endogenous protein from MP is assumed to be 0.67. The net effect of endogenous protein is modeled
          with the term 2.34*DMI.

          DMTP (digestible microbial true protein, g d-1) is calculated acc. to equation 3.19 in FiM (2004):

          DMTP = 0.6375 * MCP

          MCP = microbial crude protein, g d-1

          MCP is calculated acc. to AFRC (1993) page 16:

          MCP, g d-1 = 11 * FME

          FME = fermentable metabolisable energy, MJ kg-1 DM = ME - ME_fat - ME_ferm
        */

        , DMTP = 0.6375 * 11 * (ME_total - ME_fat - ME_ferm)
        , MP = 4.1 * pow(BW, 0.5) + 0.3 * pow(BW, 0.6) + 30.0 * DMI - 0.5 * ((DMTP / 0.8) - DMTP) + 2.34 * DMI
        ;

      if (f) {
        if (f < 0.3)
          ME = 0.65 * pow(BW, 0.75);
        else if (f >= 0.3 && f <= 0.99)
          ME = 0.68 * pow(BW, 0.75);
        else
          ME = 0.74 * pow(BW, 0.75);
      }

      return {
          E: ME
        , P: MP
      };

    } else {
          /* TODO: exclude feed level adjustment in SOLID-DSS. Use 11 MJ ME/kg TM instead of ME_total / DMI */
      var ME = 22.2136 - ME_total / DMI * 3.3290 + BW * 0.1357 + BWC * 48.5855
        , MP = 80.7936 + BW * 0.3571 + BWC * 223.1852
        ;

      return {
          E: ME
        , P: MP
      };

    }

  };

  /*
    AFRC (1993), Tyrell (1965)

    The energy requirements for milk production are not calculated acc. to FiM (2004), because FiM calculates energy 
    requirements for maintenance and milk production together and uses an efficiency of using energy for lactation (k_l)
    that changes with increasing energy intake. Because in SOLID-DSS energy requirements for maintenance are calculated
    acc. to Dong et al. (2014), energy requirements for milk production cannot be calculated acc. to FiM (2004).

    The k_l value of 0.62 is taken from Dong et al. (2014). The equation for calculating the energy value of milk is
    taken from Tyrell and Reid (1965), which is used both by AFRC (1993) and FiM (2004).

    production  [{ME, MP}]  
    milk        [kg]
    fat         [%]
    protein     [%]
    p           [#]         parity
  */

  var production = function (milk, fat, protein, p) {

    if (p > 0) {

      var energy_value_of_milk = 0.0376 * fat * 10.0 + 0.0209 * protein * 10.0 + 0.948 /* fat and protein in g per kg */
        , ME = (milk * energy_value_of_milk) / 0.62

        /*
          ARFC (1993) eqs. 87, 88

          The crude protein of milk contains 0.95 true protein. The efficiency of utilization of absorbed amino acids for 
          milk protein synthesis is assumed to be 0.68.
        */

        , MP = (milk * protein * 10.0 * 0.95 ) / 0.68 /* protein in g per kg */
        ;

      return {
          E: ME
        , P: MP
      };

    } else {

      return {
          E: 0
        , P: 0
      };

    }

  };

  /*
    Equation for energy requirement for gestation taken from FiM (2004) p. 16 and accompanying CD p., adapted from
    AFRC (1993) equations 70, 71, 72

    Equation for protein requirement for gestation taken from FiM (2004) p. 24 and accompanying CD p. 16, adapted from
    AFRC (1993), equations 109 and 110. The efficiency of utilizing MP for pregnancy is assumed to be 0.85.

    gestation [{ME, MP}]
    WG        [week]      Week of gestation (1-40)
    p         [#]         parity
  */

  var gestation = function (WG, p) {

    if (p > 0) {

      var ME = 0
        , MP = 0
          /* EGU (FiM 2004) = E_t (AFRC 1993) = energy retention in the gravid foetus */
        , EGU = exp(((151.665 - (151.64 * exp(-0.0000576 * WG * 7)))) * 2.30258)
          /* TtT (FiM 2004) = TP_t (AFRC 1993) = net protein retention for pregnancy to produce a 40 kg calf */
        , TtT = 1000 * exp(log(10) * (3.707 - (5.698 * exp(-0.00262 * WG * 7))))   
        ;

      if (WG > 0) {

        if (WG * 7 >= 250)
          ME = EGU * (0.0201 * exp(-0.0000576 * WG * 7)) / 0.133;

        MP = TtT * (0.03437 * exp(-0.00262 * WG * 7)) / 0.85;
      
      }

      return {
          E: ME
        , P: MP
      };

    } else {

      return {
          E: 0
        , P: 0
      };

    }

  };

  /*
    FiM (2004) eqs. 2.2, 2.3, AFRC (1993) eqs. 114, 115

    Equation for energy supply from weight loss and gain from FiM (2004).

    Feed into Milk does not give any information in which stages of lactation mobilization and reconstitution of body
    reserves is to be expected. For weight loss, an efficiency of utilizing mobilized body protein for milk production
    of 1.0 is assumed. The net energy value of 1 kg live weight gain is assumed to be 19.3 MJ, and the efficiency of 
    utilizing ME for weight gain is assumed to be 65%. This equation is different from AFRC (1993), where older 
    equations based on castrated males of medium-sized cattle breeds were used.

    Equation for protein supply from weight loss and gain from AFRC (1993).

    The net protein content of empty body weight change is 150 g / kg, which is equivalent to 138 g kg-1 live weight
    gain. The efficiency of utilizing MP for weight gain is assumed to be 0.59, and 138 / 0.59 = 233. The efficiency of
    utilizing MP for pregnancy is assumed to be 0.85.

    weight  [{ME, MP}]
    BWC     [kg]        body weight change
    p       [#]         parity
  */

  var weight = function (BWC, p) {

    if (p > 0) {

      var ME = 0
        , MP = 0
        ;

      if (BWC < 0) {
        ME = 19.3 * BWC * 0.78;
        MP = BWC * 138.0;
      } else {
        ME = 19.3 * BWC / 0.65
        MP = BWC * 233.0;
      }

      return {
          E: ME
        , P: MP
      };

    } else {

      return {
          E: 0
        , P: 0
      };

    }

  };

  /*
    AFRC (1993)
    
    The calculation of energy required for activity is the same as in AFRC 1993. We do not use this function but add 
    it for the sake of completeness. Adjustment for activity is done with equations from NRC.

    activity_   [{ME, MP}]
    BW          [kg]        Body weight
    DMI         [kg]        Total dry matter intake
    ME_intake   [MJ]        Total intake of ME
  */

  var activity_ = function (BW, DMI, ME_intake) {

    var MP = 0
      /* efficiency of utilization of ME for maintenance */
      , k_m = 0.019 * (ME_intake / DMI) + 0.503
      , ME =  (0.0013 * BW) / k_m
      ;

    return {
        E: ME
      , P: MP
    };

  };

  return {
      main: maintenance
    , prod: production
    , gest: gestation
    , weit: weight
    , actv: activity
  };

}());

/*
  Agabriel, J. (ed.) (2010)

  cows
  
  Energy and protein requirements according to the French system of feed evaluation and requirements. Energy is
  expressed as UFL (unité fourragere lait) and protein is expressed as g PDI, true protein.

  Information about energy mobilization is taken from Jarrige (1989).

  young stock

  Energy and protein requirements according to the French system of feed evaluation and requirements.

  Agabriel (2010) mostly refers to Jarrige (1988) with regard to the energy and protein requirements for dairy heifers,
  therefore most of the references are from Jarrige (1989).

  Energy is expressed as UFL (unité fourragere lait) and protein is expressed as g PDI (true protein).

  INRA doesn´t mention an activity addition due to grazing for heifers, but the NRC approach as described
  above will be used nonetheless.

  The energy and protein requirements for gestation are not calculated separately, but are included in the
  requirements for growth.
*/

var fr = (function () {

  /*
    Agabriel (2010) eqs. 2.7, 2.16, Dong (2014)

    cows

    Energy requirements for maintenance adjusted for forage proportion acc. to Dong et al. (2014), see above.

    young stock

    Equation for energy requirement for maintenance taken from Agabriel (2010) p. 94, 95 and Table 5.1.
    Equation for protein requirement for maintenance taken from Agabriel (2010) p. 94.
    For calculating k_m and k_l according to Agabriel (2010) Table 8.1, q (ME/GE) is assumed to be 0.57.

    maintenance [{UFL, PDI}]      Adjusted for share of forages in diet (by AFBI)
    BW          [kg]              Body weight
    DMI         [kg]              Dry matter intake (if unknow assume IC ~ DMI @ FV = 1)
    f           [kg (DM) kg (DM)] Share of forage in diet
    p           [#]               parity
  */

  var maintenance = function (BW, DMI, f, p) {

    if (p > 0) {

      var UFL = 0.041 * pow(BW, 0.75)
        , PDI = 3.25 * pow(BW, 0.75)
        ;

      if (f) {
        if (f < 0.3)
          UFL = 0.039 * pow(BW, 0.75); /* k_l = 0.60 */
        else if (f >= 0.3 && f <= 0.99)
          UFL = 0.041 * pow(BW, 0.75);
        else
          UFL = 0.045 * pow(BW, 0.75);
      }

      return {
          E: UFL
        , P: PDI
      };

    } else {

          /* k_m [0-1] efficency of using ME for maintenance */
      var k_m = 0.287 * 0.57 + 0.554
          /* k_l [0-1] efficency of using ME for lactation TODO: (0.57-0.57)? */
        , k_l = 0.60 + 0.24 * (0.57-0.57)
        , UFL = (((90 * pow(BW, 0.75)) * k_l ) / k_m) / 1700
        , PDI = 3.25 * pow(BW, 0.75)
        ;

      return {
          E: UFL
        , P: PDI
      };

    }

  };

  /*
    Agabriel (2010) eqs. 2.9, 2.18

    production  [{UFL, PDI}]  
    milk        [kg]          Milk yield in kg raw milk
    fat         [%]           Milk fat content
    protein     [%]           Milk protein content
    p           [#]           parity
  */

  var production = function (milk, fat, protein, p) {

    if (p > 0) {

      /* % to g kg-1 */
      fat *= 10;
      protein *= 10;

      var UFL = milk * (0.44 + (0.0055 * (fat - 40)) + (0.0033 * (protein - 31)));
      var PDI = (milk * protein) / 0.64;

      return {
          E: UFL
        , P: PDI
      };

    } else {

      return {
          E: 0
        , P: 0
      };      

    }

  };

  /*
    Agabriel (2010) eqs. 2.14, 2.19

    gestation   [{UFL, PDI}]  
    WG          [week]        Week of gestation (1-40)
    WB          [kg]          Birthweight of calf
    p           [#]           parity
  */

  var gestation = function (WG, WB, p) {

    if (p > 0) {

      var UFL = 0
        , PDI = 0
        ;

      if (WG > 0) {
        UFL = 0.00072 * WB * exp(0.116 * WG);
        PDI = 0.07 * WB * exp(0.111 * WG);
      }

      return {
          E: UFL
        , P: PDI
      };

    } else {

      return {
          E: 0
        , P: 0
      };      

    }

  };

  /*
    cows

    Energy requirement and supply for and from weight change taken from Jarrige (1989) p. 75.

    Protein supply from weight change taken from Agabriel (2010) p. 31, paragraph below eq. 2.24.

    The French system does not include protein requirements for reconstitution of body reserves.

    young stock

    Equation for calculating energy requirement for growth taken from Agabriel (2010) p. 95 and equation 5.1

    Equation for calculating protein requirement for growth taken from Jarrige (1989) p.

    Both the energy and protein requirements for growth depend on the composition of the body weight gain, and the
    parameters GLIP and GPROT represent the daily gain of fat and protein, respectively. GLIP and GPROT are calculated
    using a model originally published by Robelin and Daenicke (1980), which is used in an updated form in Agabriel
    (2010). For use in SOLID-DSS, the animal category "early maturing heifer" (génisses précoces en croissance) was
    chosen, and the growth model is valid for such heifers with body weights between 200 and 480 kg.

    For calculating k_l and k_f according to Agabriel (2010) Table 8.1, q (ME/GE) is assumed to be 0.57.

    k_PDI values were taken from Jarrige (1989) Table 9.3

    weight  [{UFL, PDI}]  
    BW      [kg]          body weight
    BWC     [kg]          body weight change
    WL      [week]        week of lactation
    p       [#]           parity
  */

  var weight = function (BW, BWC, WL, p) {

    if (p > 0) {
    
      var UFL = 0
        , PDI = 0
        ;

      if (BWC < 0) {
        /* 3.5 = 4.5 * 0.8; 80 % of the energy content of body reserves is used for milk production */
        UFL = BWC * 3.5;
      } else {
        UFL = BWC * 4.5;
      }

      if (BWC < 0 && WL <= 8)
        PDI = 40 * UFL;

      return {
          E: UFL
        , P: PDI
      };

    } else {

          /* EBW [kg] empty body weight, Agabriel (2010) p. 96 equation 5.9, with C_0 = 0.482 and C_1 = 1.096 */
      var EBW = 0.482 * pow(BW, 1.096)
          /*LIP [kg] lipid content of the body weight, Agabriel (2010) p. 96 equation 5.13*/
        , LIP = 0.001 * pow(EBW, (1.883))
          /*FFBW[kg] fat free body weight*/
        , FFBW = BW - LIP
          /*PROT [kg] protein content of the body weight, Agabriel (2010) p. 97 equation 5.14*/
        , PROT = 0.1436 * pow(FFBW, (1.0723))
          /* EBWC [kg] empty body weight change, Agabriel (2010) p. 97 equation 5.16, with C_1 = 1.096 */
        , EBWC = (EBW / BW) * 1.096 * BWC
          /* GLIP [kg] daily gain of fat, Agabriel (2010) p. 97 equation 5.17, with B_0 = 0.001 and B_1 = 1.883 */
        , GLIP = 0.001 * 1.883 * pow(EBW, (1.883-1)) * EBWC
          /*FFBWC [kg] fat free body weight change*/
        , FFBWC = BWC - GLIP
          /* GPROT [kg] daily gain of protein */
        , GPROT = PROT / FFBW * FFBWC * 1.0723
          /* RE [Mcal day-1] energy retention */
        , RE = 5.48 * GPROT + 9.39 * GLIP
          /* k_l [0-1] efficency of using ME for lactation */
        , k_l = 0.60 + 0.24 * (0.57-0.57)
          /* k_f [0-1] efficency of using ME for growth */
        , k_f = 0.78 * 0.57 + 0.006
          /* k_PDI [0-1] efficency of using PDI for growth */
        , k_PDI = 0
        , UFL = ((RE * k_l) / k_f ) / 1.7
        , PDI = 0
        ;

      if (BW <= 400)
        k_PDI = 0.68;
      else if (400 < BW <= 600)
        k_PDI = 0.53;
      else
        k_PDI = 0.28;

      PDI = (GPROT * 1000) / k_PDI;

      return {
          E: UFL
        , P: PDI
      };

    }

  };

  /*
    Agabriel (2010) eqs. 2.8, 2.17 

    Implemented for the sake of completeness: We use our own growth function.

    growth  [{UFL, PDI}]  
    AGE     [month]       age of the cow
  */

  var growth = function (AGE) {

    var UFL = 3.25 - 0.08 * AGE
      , PDI = 422 - 10.4 * AGE
      ;

    return {
        E: UFL
      , P: PDI
    };

  };

  return {
      main: maintenance
    , prod: production
    , gest: gestation
    , weit: weight
    , actv: activity
  };

}());

return {
    de: de
  , fi: fi
  , gb: gb
  , fr: fr
};

}());


/*
  The energetic value of feeds is described using four different country-specific systems of feed evaluation, the
  German, Finnish, British and French system.

  Energy is the first limiting factor for the performance of a dairy cow, apart from feed intake capacity, therefore
  the accuracy of the energetic evaluation of the feeds is of great importance for the accuracy of SOLID-DSS as a whole.
  Offering several different systems of energy evaluation also improves the usability of SOLID-DSS. This first version
  of SOLID-DSS includes the above mentioned four systems of energy evaluation, but adding further systems is desirable.

  For the protein evaluation of feeds, only the German uCP system is used.

  Generally speaking, the protein value of a feed is related to the degradability of the protein in the rumen, the
  content of amino acids in the undegraded crude protein and the digestibility of the amino acids in the undegraded
  dietary protein. Internationally, there is a trend towards sophisticated systems of protein evaluation that take the
  dynamics of feed digestion into account and describe the nitrogen metabolism in the gastro-intestinal tract of
  ruminants.

  The British system of protein evaluation, for example, is one of those sophisticated systems, requring digestibility
  parameters analysed with in vitro and NIRS methods.

  The diet model of SOLID-DSS is used in conjunction with the plant growth models. Unfortunately none of the plant
  growth models available today can supply the data needed to characterize feeds according to the British system of
  protein evaluation.

  That is why the German uCP system, which is the simplest out of the four above-mentioned country-specific systems of
  feed evaluation, is used for all countries in SOLID-DSS. Even though the amount of utilizable protein at the
  duodenum is defined as the sum of ruminally undegraded protein and microbial protein, the uCP content of a feed is
  calculated with simple empirical equations.

  In a comparison between the German uCP system with the Finnish system and the NRC (2001), using data from US
  production experiments, Schwab et al. (2005) found that the German uCP system predicted milk protein yield as well or
  even better than the NRC and Finnish system, despite being much simpler. The fact that the German uCP system performed
  well in comparison with more sophisticated systems, despite its simplicity, encourages its use for SOLID-DSS.

  Feed intake is predicted according to GrazeIn, a system based on the fill value system of INRA (Agabriel 2010). In
  order to calculate the fill values of the forages, the parameters QIL (for dairy cows) and QIB (for dairy heifers)
  are calculated, see below.

  REFERENCES

  Agabriel, J. 2010. Alimentation des bovins, ovins et caprins. Besoins des animaux - Valeurs des aliments. Tables INRA
  2010. Editions Quae, France.
  
  Feed into Milk Consortium. 2004. Feed into Milk. A new applied feeding system for dairy cows. An advisory manual.
  Ed. Thomas, C. Nottingham University Press, UK.
  
  GfE [Society of Nutrition Physiology] 2001. Empfehlungen zur Energie- und Nährstoffversorgung der Milchkühe und
  Aufzuchtrinder [Recommendations on the energy and nutrient supply for dairy cows and heifers]. DLG-Verlag, Frankfurt/
  Main, Germany.
  
  Lebzien, P., Voigt, J., Gabel, M. und Gädeken, D. 1996. Zur Schätzung der Menge an nutzbarem Rohprotein am Duodenum
  von Milchkühen. [On the estimation of utilizable crude protein at the duodenum of dairy cows] Journal of Animal
  Physiology and Animal Nutrition 76:218-223.
  
  MTT. 2006. Rehutaulukot ja ruokintasuositukset [Feed tables and feeding recommendations]. Agrifood Research Finland,
  Jokioninen, Finland.
  
  MTT 2014. Rehutaulukot ja ruokintasuositukset [Feed tables and feeding recommendations] [online]. Agrifood
  Research Finland, Jokioinen. Accessed last on November 20, 2014, available at:
  https://portal.mtt.fi/portal/page/portal/Rehutaulukot/feed_tables_english
  
  Schwab, G.C., Huhtanen, P., Hunt, C.W. and Hvelplund, T. 2005. Nitrogen requirements of cattle. In: Pfeffer, E. and
  Hristov, A.N. (ed.). Nitrogen and Phosphorus Nutrition of Cattle. CABI Publishing, Wallingford, UK. p. 13-70.

  Tran, G. et Sauvant, D. 2002. In: Sauvant D., Perez J.-M. et Tran G. (eds.) Tables de composition et de valeur
  nutritive des matières premières destinées aux animaux d´élevage: porcs, volailles, bovins, ovins, caprins, lapins,
  chevaux, poissons. Paris, Inra-AFZ, France. p. 22.

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

dairy.feed.evaluation = (function () {

/*
  The German system of feed evaluation is described in GfE (2001)

  Energy is expressed in MJ net energy lactation (NEL)

  Protein is expressed in g utilizable crude protein at the duodenum (uCP)
*/

var de = (function () {

  /*
    Equation for calculating gross energy (GE) taken from GfE (2001) equation 1.1.1

    GE  [MJ kg-1 (DM)]  gross energy
    CP  [g kg-1 (DM)]   crude protein, e.g. 235   
    EE  [g kg-1 (DM)]   ether extracts, e.g. 43
    CF  [g kg-1 (DM)]   crude fibre, e.g. 172
    OM  [g kg-1 (DM)]   organic matter, e.g. 905
  */

  var GE = function (CP, EE, CF, OM) {

    return 0.0239 * CP + 0.0398 * EE + 0.0201 * CF + 0.0175 * (OM - EE - CP - CF);
    
  };

  /*
    Equation for calculating metabolizable energy (ME) taken from GfE (2001) equation 1.1.2

    ME  [MJ kg-1 (DM)]  metabolizable energy
    CP  [g kg-1 (DM)]   crude protein, e.g. 235   
    EE  [g kg-1 (DM)]   ether extracts, e.g. 43
    EED [kg kg-1]       digestibility of ether extracts, e.g. 0.61
    CF  [g kg-1 (DM)]   crude fibre, e.g. 172
    CFD [kg kg-1]       digestibility of crude fiber, e.g. 0.81
    OM  [g kg-1 (DM)]   organic matter, e.g. 905
    OMD [kg kg-1]       digestibility of organic matter, e.g. 0.84
  */

  var ME = function (CP, EE, EED, CF, CFD, OM, OMD) {

    var ME = 0;    

    /*contents of digestible ether extracts, digestible crude fiber and digestible organic matter [g kg-1 (DM)]*/
    var dEE = EE * EED;
    var dCF = CF * CFD;
    var dOM = OM * OMD;

    /* metabolizable energy [MJ kg-1 (DM)], e.g. 12.0 */
    ME = 0.0312 * dEE + 0.0136 * dCF + 0.0147 * (dOM - dEE - dCF) + 0.00234 * CP;

    return ME;
    
  };

  /*
    Equation for calculating the metabolizability (q) taken from  GfE (2001) page 17

    Equation for calculating net energy for lactation (NEL) taken from GfE (2001) equation 1.3.1

    NEL [MJ kg-1 (DM)]  net energy for lactation, e.g. 7.04
    ME  [MJ kg-1 (DM)]  metabolizable energy
    GE  [MJ kg-1 (DM)]  gross energy
  */

  var NEL = function (ME, GE) {

    var NEL = 0;

    /*the metabolizability is the factor between GE and ME, e.g. 64*/
    var q = ME / GE * 100;

    /* net energy for lactation [MJ kg-1 (DM)]*/
    NEL = 0.6 * (1 + 0.004 * (q - 57)) * ME;

    return NEL;

  };

  /*
    Equation for calculating utilizable crude protein at the duodenum (uCP) taken from GfE (2001) Table 2.1.1, equation
    1a, originally published by Lebzien et al. (1996). (In the above mentioned comparison between different systems of
    protein evaluation done by Schwab et al. (2005), equation 1a was used as well.)

    uCP [g kg-1 (DM)]   utilizable crude protein
    ME  [MJ kg-1 (DM)]  metabolizable energy
    CP  [g kg-1 (DM)]   crude protein
  */

  var uCP = function (ME, CP) {

    return 8.76 * ME + 0.36 * CP; 
    
  };


  /*
    Apart from satisfying the cow´s requirement of uCP, the German system also calculates the ruminal nitrogen balance
    in order to ensure an adequate supply of ruminally available protein for the ruminal microbes.

    Equation for calculating the ruminal nitrogen balance (RNB) taken from GfE (2001) page 45

    RNB [g kg-1 (DM)] ruminal nitrogen balance, e.g. 4
    CP  [g kg-1 (DM)] crude protein, e.g. 235
    uCP [g kg-1 (DM)] utilizable crude protein, e.g. 220
  */

  var RNB = function (CP, uCP) {

    return (CP - uCP) / 6.25; 
    
  };

  return {
      GE: GE
    , ME: ME
    , E_f: NEL
    , E_c: NEL
    , uCP: uCP
    , RNB: RNB
  };

}());

var fi = (function () {

  /*
    The last description of the Finnish system of feed evaluation published in print is MTT (2006). Since then all
    updates have been published online, hereafter quoted as MTT (2014). 

    Equations for calculating the energy contents of forages taken from the sub-site "Energy value, ruminants" of
    MTT (2014)

    Energy is expressed in MJ metabolizable energy (ME)

    ME_f  [MJ kg-1 (DM)]      metabolizable energy content of a forage, e.g. 11.4 
    OM    [g kg-1 (DM)]       organic matter, e.g. 915
    OMD   [kg kg-1]           digestibility of organic matter, e.g. 0.78
    type  [enum]              grasssilage (default), hay, straw, wholecropsilage

    TODO: Im finnischen System gibts eine correction equation for energy intake, die auf der supply-Seite angewendet
    wird. Das ist noch zu klären ob und wie wir das anwenden.
  */

  var ME_f = function (OMD, OM, type) {

    /* In the MTT feed tables, the content of digestible organic matter in dry matter is called D-value, but because
    using the same terminology in all country-specific systems makes SOLID-DSS less susceptible to errors, the term dOM
    is used instead [g kg-1 (DM)]*/
    var dOM = OM * OMD;

    /* fresh forages, fresh maize, fresh sorghum and grasssilage*/
    var ME_f = 0.016 * dOM;

    /*in Finland, maize silage is not commonly used. However, in case of using maize silage, the equation for wholecrop
    cereal silages can be used for maize silage as well. Consequently, the equation for maize silage is the same as the
    one for whole crop silage.*/

    if (type === 'hay')
      ME_f = 0.0169 * dOM - 1.05;
    if (type === 'maizesilage')
      ME_f = 0.0155 * dOM;
    else if (type === 'straw')
      ME_f = 0.014 * dOM;
    else if (type === 'wholecropsilage')
      ME_f = 0.0155 * dOM;

    return ME_f;    

  };

  /*
    Equations for calculating the energy contents of concentrates taken from the sub-site "Energy value, ruminants" of
    MTT (2014)

    Energy is expressed in MJ metabolizable energy (ME)
    
    The feed table included in SOLID-DSS gives the NfE digestibility of the feeds, but the plant growth models in
    SOLID-DSS don´t supply the digestibility of NfE, therefore the following calculation is mainly given for reasons of
    completeness.

    ME_c  [MJ kg-1 (DM)]      metabolizable energy of a concentrate, e.g. 12.2
    CP    [g kg-1 (DM)]       crude protein content, e.g. 125
    CPD   [kg kg-1]           digestibility of crude protein, e.g. 0.71
    CF    [g kg-1 (DM)]       crude fibre, e.g. 103
    CFD   [kg kg-1]           digestibility of crude fiber, e.g. 0.30
    EE    [g kg-1 (DM)]       ether extract content, e.g. 60
    EED   [kg kg-1]           digestibility of ether extracts, e.g. 0.84
    NFE   [g kg-1 (DM)]       nitrogen free extracts, e.g. 500
    NFED  [kg kg-1]           digestibility of nitrogen free extracts, e.g. 0.83
  */

  var ME_c = function (CP, CPD, CF, CFD, EE, EED, NFE, NFED) {

    var dCP = CP * CPD;
    /*content of digestible crude protein*/
    var dEE = EE * EED;
    /*content of digestible ether extracts*/
    var dCF = CF * CFD;
    /*content of digestible crude fiber*/
    var dNFE = NFE * NFED;
    /*content of digestible nitrogen free extracts*/

    var ME_c = (15.2 * dCP + 34.2 * dEE + 12.8 * dCF + 15.9 * dNFE) * 1e-3;

    return ME_c;    

  };

  return {
      E_f: ME_f
    , E_c: ME_c
  };

}());

var gb = (function () {

  /*
    The British system of feed evaluation is described in Feed into Milk (2004)

    Energy is expressed in MJ metabolisable energy (ME)

    Only the energy values of forages are calculated, the energy values of concentrates are taken from the feed table
    that comes with SOLID-DSS. The reason is that the plant growth models can´t supply the parameters NCGD and AHEE,
    which are needed for the calculation of the energy content of concentrates. NCGD is the neutral detergent cellulase
    plus gammanase digestibility, which is a modified version of Van Soest´s NDF. AHEE is the acid hydrolysed ether
    extract, meaning that before ether extraction the feed is hydrolysed with hydrochloric acid.

    ME              [MJ kg-1 (DM)]  metabolizable energy, e.g. 12.8
    OM              [g kg-1 (DM)]   organic matter, e.g. 911
    OMD             [kg kg-1]       digestibility of organic matter, e.g. 0.88
    is_grass_or_hay [bool]
  */

  var ME_f = function (OM, OMD, is_grass_or_hay) {

    /* In Feed into Milk, the content of digestible organic matter in dry matter is called DOMD, expressed in %, so the
    equation is ME = 0.16 * DOMD. Because using the same terminology in all country-specific systems makes SOLID-DSS less
    susceptible to errors, the term dOM is used instead [g kg-1 (DM)], so the equation is ME = 0.016 * dOM*/
    var dOM = OM * OMD;

    var ME_f = 0.016 * dOM;

    if (is_grass_or_hay)
      ME_f = 0.015 * dOM;

    return ME_f;

  };

  return {
      E_f: ME_f
    , E_c: ME_f
  };

}());

var fr = (function () {

  /*
    The French system of feed evaluation is described in Agabriel (2010)

    Energy is expressed in unité fourragére lait (UFL). One UFL equals the net energy for lactation of 1 kg standard
    barley.

    Equations for calculating energy values (UFL) of forages taken from Agabriel (2010) Tables 8.1, 8.8 and 8.9.

    In order to provide values for feeding level (L), the requirements (req_m, req_t) according to the French system are
    used, details see dairy.requirements.
  
    UFL_f   [UFL kg-1 (DM)] energy content of a forage, e.g. 0.89
    OMD     [kg kg-1]       digestibility of organic matter, e.g. 0.72
    OM      [?]
    CP      [g kg-1 (DM)]   crude protein content, e.g. 134
    CF      [g kg-1 (DM)]   crude fibre content, e.g. 296
    type    [enum]          type of feed
    DM      [%]             dry matter content
    delta_F1
    pH      []              pH of grass silage
    wilted  [bool]          grasssilage wilted (true) or grassilage short cut and directly ensiled 
    req_m   [UFL]           maintenance requirements
    req_t   [UFL]           total requirements
  */

  var UFL_f = function (OMD, OM, CP, CF, type, DM, delta_F1, pH, wilted, req_m, req_t) {

    var UFL_f = 0
        /* default in case grass silage pH is not available */
      , pH = pH || 4.8
      ;

    /*contents of crude protein and crude fibre in organic matter, g kg-1 OM*/
    var CP_o = CP / OM * 1000;
    var CF_o = CF / OM * 1000;

 /* gross energy [kcal kg-1 (OM)] content per kg organic matter of fresh fodder, hay and haylage */
    var GE_o = 4531 + 1.735 * CP_o + delta_F1;
    if (type === 'freshsorghum') {
      GE_o = 4478 + 1.265 * CP_o;
    } else if (type === 'freshmaize') {
      GE_o = 4487 + 2.019 * CP_o;
    } else if (type === 'maizesilage') {
      if (DM <= 30)
        GE_o = 1.02 * (4487 + 2.019 * CP_o);
      else
        GE_o = 4487 + 2.019 * CP_o + 25;    
    } else if (type === 'grassilage') {
      if (wilted)
        GE_o = 1.03 * (3910 + 2.45 * CP_o + 169.9 * pH)
      else
        GE_o = 3910 + 2.45 * CP_o + 169.9 * pH;
  /*the gross energy content of wholecropsilage is calculated the same way as wilted grasssilage, that´s why the equations
  are the same*/
    } else if (type === 'wholecropsilage') {
      GE_o = 1.03 * (3910 + 2.45 * CP_o + 169.9 * pH);
    } else if (type === 'dehydrated alfalfa') {
      GE_o = 4618 + 2.051 * CP_o;
    }

    /*
    delta_F1  []  feed material correction coefficient:
                    grasses = -71
                    clover, sainfoin, grass from mountainous areas, hay from leys and whole crops = -11
                    fresh alfalfa and fresh fodder and hay from permanent grassland = + 82
    */

    /*For the remaining steps of the energy calculation, GE is needed on dry matter basis*/
    var GE = (GE_o * OM) / 1000;

    /* digestibility of energy [%] in fresh grasses and legumes, e.g. 68
    In INRA the values for OMD are in %, e.g. 80. Because using the same terminology in all country-specific systems
    makes SOLID-DSS less susceptible to errors, OMD is used in kg kg-1, just like in the other systems. Consequently,
    the French equations for dE (%) were adjusted.*/
    var dE = 0.957 * (OMD * 100) - 0.068;
    if (type === 'freshmaize')
      dE = 0.997 * (OMD * 100) - 2.53;
    if (type === 'maizesilage')
      dE = 1.001 * (OMD * 100) - 2.86;
    if (type === 'grasssilage')
      dE = 1.0263 * (OMD * 100) - 5.723;
    /*dE of wholecropsilage is calculated the same way as wilted grasssilage, that´s why the equations are the same*/
    if (type === 'wholecropsilage')
      dE = 1.0263 * (OMD * 100) - 5.723;
    if (type === 'dehydrated alfalfa')
      dE = 1.003 * (OMD * 100) - 3.00;
    if (type === 'straw')
      dE = 0.985 * (OMD * 100) - 2.949;
    else if (type === 'hay')
      dE = 0.985 * (OMD * 100) - 2.556;

    /* feeding level, e.g. 1.5 */
    var L = req_t / req_m;

    /*energy losses due to urine excretion and gaseous losses products of digestion = the energy loss between digestible
    energy (DE) and metabolizable energy (ME), e.g. 0.81*/
    var ME_DE = (84.17 - 0.0099 * CF_o - 0.0196 * CP_o + 2.21 * L) / 100;

    /* ME [kcal kg-1 (DM)], e.g. 2536 */
    var ME = GE * (dE/100) * ME_DE;

    /* efficiency of utilizing metabolizable energy for milk production = energy lost as heat, e.g. 0.60*/
    var k_l = 0.463 + 0.24 * ME / GE;

    /*net energy for lactation, NEL [kcal kg-1 (DM)], e.g. 1512*/
    var NEL = ME * k_l;

    /*UFL_f kg-1 DM, e.g. 0.89*/
    UFL_f = ME * k_l / 1700;

    return UFL_f;

  };

  /*
    Equations for calculating energy values (UFL) of concentrates taken from Agabriel (2010) Tables 8.1, 8.8 and 8.9.

    UFL_c     [kg-1 (DM)]     energy content of a concentrate
    OMD       [kg kg-1]       digestibility of organic matter, e.g. 0.72
    OM        [?]
    CP        [g kg-1 (DM)]   crude protein, e.g. 111
    EE        [g kg-1 (DM)]   ether extracts, e.g. 67
    CF        [g kg-1 (DM)]   crude fibre, e.g. 135
    NDF       [g kg-1 (DM)]   neutral detergent fibre, e.g. 336
    ash       [g kg-1 (DM)]   ash, e.g. 30
    req_m     [UFL]           maintenance requirements
    req_t     [UFL]           total requirements
    delta_C1  []              feed material group correction coefficient taken from Tran et Sauvant (2002)

    corn gluten meal = 308
    alfalfa protein concentrate = 248
    wheat distillery by-products, wheat gluten feed, maize bran, rice bran = 138
    full fat rapeseed, full fat linseed, full-fat cottonseed, cottonseed meal = 116
    oats, wheat milling by-products, corn gluten feed and other maize starch by-products, maize feed
    flour, sorghum = 75
    dehydrated grass, straw = 46
    barley = 36
    linseed meal, palm kernel meal, full fat soybean, soybean meal, sunflower meal, sunflower seed = -46
    cassava = -55
    faba bean, lupin, pea = -87
    sugar beet pulp, molasses, vinasse, potato pulp = -103
    whey = -177
    soybean hulls = -231
    all others = 0
  */

  var UFL_c = function (OMD, OM, CP, EE, CF, NDF, ash, delta_C1, req_m, req_t) {

    var UFL_c = 0;

    /*contents of crude protein and crude fibre in organic matter, g kg-1 OM*/
    var CP_o = CP / OM * 1000;
    var CF_o = CF / OM * 1000;

    /* gross energy content per kg dry matter [kcal kg-1 DM]*/
    var GE = 4134 + 1.473 * CP + 5.239 * EE + 0.925 * CF - 4.44 * ash + delta_C1;


    /* digestibility of energy [%], e.g. 72
    In INRA the values for OMD are in %, e.g. 80. Because using the same terminology in all country-specific systems
    makes SOLID-DSS less susceptible to errors, OMD is used in kg kg-1, just like in the other systems. Consequently,
    the French equations for dE (%) were adjusted.*/
    var dE = (OMD * 100) - 3.94 + 0.0104 * CP + 0.0149 * EE + 0.0022 * NDF - 0.0244 * ash;

    /* feeding level, e.g. 1 */
    var L = req_t / req_m;

    /*energy losses due to urine excretion and gaseous losses products of digestion = the energy loss between digestible
    energy (DE) and metabolizable energy (ME), e.g. 0.83*/
    var ME_DE_ratio = (84.17 - 0.0099 * CF_o - 0.0196 * CP_o + 2.21 * L) / 100

    /* ME [kcal kg (DM)], e.g. 2818 */
    var ME = GE * (dE / 100) * ME_DE_ratio;

    /* efficiency of utilizing metabolizable energy for milk production = energy lost as heat, e.g. 0.61*/
    var k_l = 0.463 + 0.24 * ME / GE;

    /*net energy for lactation, NEL [kcal kg-1 (DM)], e.g. 1709*/
    var NEL = ME * k_l;

    /*UFL_c kg-1 DM, e.g. 1.01*/
    UFL_c = NEL / 1700;

    return UFL_c;

  };

  /*
    In SOLID-DSS, feed intake is predicted according to GrazeIn (details see dairy.intake). For the calculation of the
    fill values of forages, the parameters QIL (for dairy cows) and QIB (for dairy heifers) are required.

    Equations for calculating QIL and QIB are taken from Agabriel (2010), Table 8.14.
    
    In GrazeIn, OMD is called dOM and is expressed in %, e.g. 72. Because using the same terminology in all country-
    specific systems makes SOLID-DSS less susceptible to errors, OMD is used in kg kg-1 (e.g. 0.72), just like in the
    other systems. Consequently, the equations for QIL and QIB were adjusted.

    The one expection is straw, for which Agabriel (2010) doesn´t supply an equation for calculating the fill value.
    Therefore linear regressions for the fill values of straw depending on OMD were produced based on data from the
    feed tables in Agabriel (2010) and expressed as QIL = ... and QIB = ... The linear regressions are valid for OMD
    values between 0.42 and 0.68 and fill values between 1.00 and 1.60 (QIL) and 1.07 and 2.00 (QIB). The coefficients
    of determination of the regressions are 0.23 (QIL) and 0.23 (QIB).

    QIL       [g kg-1]      ingestibility in g per kg metabolic live weight, dairy cows
    QIB       [g kg-1]      ingestibility in g per kg metabolic live weight, heifers
    OMD       [kg kg-1]     digestibility of organic matter, e.g. 0.72
    CP        [g kg-1 (DM)] crude protein content, e.g. 235
    DM        [g kg-1]      dry matter content
    type      [enum]        type of forage (fresh, grasssilage, hay, maizesilage)
    delta_FR1 []           species adjustment parameter fresh:
                              cows (QIL)
                                perm. grassland = 0
                                grasses = -3.7
                                legumes = 1.0
                              young stock (QIB)
                                perm. grassland = 0
                                grasses = -1.6
                                legumes = 4.1
    delta_S1  []            species adjustment parameter silages:
                              cows (QIL)
                                perm. grassland = 0
                                grasses = -1.4
                                legumes = 2.8
                              young stock (QIB)
                                perm. grassland = 0
                                grasses = -1.9
                                legumes = 2.8
    delta_H1  []            species adjustment parameter hay:
                              cows (QIL)
                                perm. grassland = 0
                                grasses = -0.9
                                legumes = 2.6
                              young stock (QIB)
                                perm. grassland = 0
                                grasses = -1.4
                                legumes = 3.4
    delta_S2  []            technical adjustment parameter silage:
                              cows (QIL)
                                unwilted & w/o additives = -10.1
                                unwilted & w additives = -0.8
                                wilted = 1.6
                                haylage = 0
                              young stock (QIB)
                                unwilted & w/o additives = -9.9
                                unwilted & w additives = -0.9
                                wilted = 1.9
                                haylage = 0
    delta_H2  []            technical adjustment parameter hay:
                              cows (QIL)
                                ventilated = 6.6
                                wilted in sun & good weather = 5.5
                                wilted in sun = 0
                              young stock (QIB)
                                ventilated = 6.6
                                wilted in sun & good weather = 5.2
                                wilted in sun = 0
  */

  var QIL = function (OMD, CP, DM, type, delta_FR1, delta_S1, delta_H1, delta_S2, delta_H2) {

    var QIL = 0;

    if (type === 'fresh')
      QIL = 66.3 + 0.655 * (OMD * 100) + 0.098 * CP + 0.626 * (DM / 10) + delta_FR1;
    else if (type === 'grasssilage')
      QIL = 99.3 + 0.167 * (OMD * 100) + 0.128 * CP + delta_S1 + delta_S2;
    else if (type === 'hay')
      QIL = 82.4 + 0.491 * (OMD * 100) + 0.114 * CP + delta_H1 + delta_H2;
    else if (type === 'maizesilage')
      QIL = -76.4 + 2.39 * (OMD * 100) + 1.44 * (DM / 10);
    else if (type === 'straw')
      QIL = 140 / (1.938 - 0.013 * (OMD * 100)); 
    else 
      QIL = 66.3 + 0.655 * (OMD * 100) + 0.098 * CP + 0.626 * (DM / 10);

    return QIL;

  };

  var QIB = function (OMD, CP, DM, type, delta_FR1, delta_S1, delta_H1, delta_S2, delta_H2) {

    var QIB = 0;

    if (type === 'fresh')
      QIB = 6.44 + 0.782 * (OMD * 100) + 0.112 * CP + 0.679 * (DM / 10) + delta_FR12;
    else if (type === 'grasssilage')
      QIB = 47 + 0.228 * (OMD * 100) + 0.148 * CP + delta_S12 + delta_S22;
    else if (type === 'hay')
      QIB = 30.3 + 0.559 * (OMD * 100) + 0.132 * CP + delta_H12 + delta_H22;
    else if (type === 'maizesilage')
      QIB = -45.49 + 1.34 * (OMD * 100) + 1.15 * (DM / 10);
    else if (type === 'straw')
      QIB = 95 / (2.380 - 0.018 * (OMD * 100)); 
    else 
      QIB = 6.44 + 0.782 * (OMD * 100) + 0.112 * CP + 0.679 * (DM / 10);

    return QIB;

  };

  return {
      E_f: UFL_f
    , E_c: UFL_c
    , QIL: QIL
    , QIB: QIB
  };

}());

return {
    de: de
  , fi: fi
  , gb: gb
  , fr: fr
};

}());


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


