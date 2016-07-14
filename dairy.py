#   Dairy cow grouping.
#
#   It creates groups a such that the total deviation of energy and protein requirements relative to the cow's intake
#   capacity from the groups average is minimized (similar to McGilliard 1983). In the resulting groups animals in each
#   group require a "similar" energy and protein density of the ration. The results of each run slightly defer depending on
#   the inital guess of k-means. Therefore it runs several times and returns the best result.
#
#   REFERENCES
#
#   McGilliard, M.L., Swisher, J.M. and James, R.E. 1983. Grouping lactating cows by nutritional requirements for feeding.
#   Journal of Dairy Science 66(5):1084-1093.
#
#   k-means.js implementation from https://github.com/cmtt/kmeans-js
#
#   LICENSE
#
#   Copyright 2014 Jan Vaillant   <jan.vaillant@zalf.de>
#   Copyright 2014 Lisa Baldinger <lisa.baldinger@boku.ac.at>
#
#   Distributed under the MIT License. See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT
#
#   Any publication for which this file or a derived work is used must include an a reference to:
#
#   Vaillant, J. and Baldinger, L. 2016.
#   Application note: An open-source JavaScript library to simulate dairy cows and young stock,
#   their growth, requirements and diets.
#   Computers and Electronics in Agriculture, Volume 120, January 2016, Pages 7–9
#
#   TODO
#
#   - implement different strategies e.g. (req. intake capacity-1, absolute requirements, days in milk)
# */
#
# dairy = dairy ||:}
#
# dairy.group = (function ():
#
# round = math.round
#   , floor = math.floor
#   , random = math.random
#   , log = math.log
#   , pow = math.pow
#   , sqrt = math.sqrt
#   , distance =  function(a, b):
#       return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2))
#     }
#     # TODO: refactor original code from cmtt kmeans.. */
#   , sortBy = function (a, b, c):
#       c = a.slice()
#       return c.sort(function (d, e):
#         d = b(d)
#         e = b(e)
#         return (d < e ? -1: d > e ? 1: 0)
#       })
#     }
#   
#
#
# # returns total of squared differences */
#
# sumSquaredDifferences = function (points, centroids):
#
#   sum = 0
#     , ps = points.length
#     
#
#   for (p = 0 p < ps p++):
#     point = points[p]
#       , centroid = centroids[point.k]
#       , dif_x = pow(point.x - centroid.x, 2)
#       , dif_y = pow(point.y - centroid.y, 2)
#       
#     sum += dif_x + dif_y
#   }
#
#   return sum
#
# }
#
# # nomalize (0-1) data. Coordinates in original data are altered */
#
# doNormalize = function (points):
#
#   ps = points.length
#
#   # get minimum and maximum x */
#   points.sort(function (a, b):
#     return a.x - b.x
#   })
#
#   x_min = points[0].x
#   x_max = points[ps - 1].x
#
#   # get minimum and maximum y */
#   points.sort(function (a, b):
#     return a.y - b.y
#   })
#
#   y_min = points[0].y
#   y_max = points[ps - 1].y
#
#   # normalize */
#   for (p = 0 p < ps p++):
#     point = points[p]
#     point.x = (point.x - x_min) / (x_max - x_min)
#     point.y = (point.y - y_min) / (y_max - y_min)
#   }
#
# }
#
# # k-means++ initialization from https://github.com/cmtt/kmeans-js */
#
# kmeansplusplus = function (points, ks):
#
#   ps = points.length
#
#   # determine the amount of tries */
#   D = []
#     , ntries = 2 + round(log(ks))
#     , centroids = []
#     
#
#   # Choose one center uniformly at random from the data points. */
#   p0 = points[floor(random() * ps)]
#
#   centroids.push({
#       x: p0.x
#     , y: p0.y
#     , k: 0
#   })
#
#   # For each data point x, compute D(x), the distance between x and the nearest center that has already been chosen. */
#   for (i = 0 i < ps ++i)
#     D[i] = pow(distance(p0, points[i]), 2)
#
#   Dsum = D.reduce(function(a, b):
#     return a + b
#   })
#
#   # Choose one new data point at random as a new center, using a weighted probability distribution where a point x is
#     chosen with probability proportional to D(x)2. (Repeated until k centers have been chosen.) */
#   for (k = 1 k < ks ++k):
#
#     bestDsum = -1, bestIdx = -1
#
#     for (i = 0 i < ntries ++i):
#       rndVal = floor(random() * Dsum)
#
#       for (n = 0 n < ps ++n):
#         if (rndVal <= D[n]):
#           break
#         } else:
#           rndVal -= D[n]
#         }
#       }
#
#       tmpD = []
#       for (m = 0 m < ps ++m):
#         cmp1 = D[m]
#         cmp2 = pow(distance(points[m], points[n]), 2)
#         tmpD[m] = cmp1 > cmp2 ? cmp2: cmp1
#       }
#
#       tmpDsum = tmpD.reduce(function(a, b):
#         return a + b
#       })
#
#       if (bestDsum < 0 || tmpDsum < bestDsum):
#         bestDsum = tmpDsum, bestIdx = n
#       }
#     }
#
#     Dsum = bestDsum
#
#     centroid =:
#         x: points[bestIdx].x
#       , y: points[bestIdx].y
#       , k: k
#     }
#
#     centroids.push(centroid)
#
#     for (i = 0 i < ps ++i):
#       cmp1 = D[i]
#       cmp2 = pow(distance(points[bestIdx], points[i]), 2)
#       D[i] = cmp1 > cmp2 ? cmp2: cmp1
#     }
#   }
#
#   # sort descending if x is energy density */
#   centroids.sort(function (a, b):
#     return b.x - a.x
#   })
#
#   # set k === index */
#   for (c = 0, cs = centroids.length c < cs c++)
#     centroids[c].k = c
#
#   return centroids
#
# }
#
# kmeans = function (points, centroids):
#
#   converged = false
#     , ks = centroids.length
#     , ps = points.length
#     
#
#   while (!converged):
#
#     i
#     converged = true
#
#     # Prepares the array of sums. */
#     sums = []
#     for (k = 0 k < ks k++)
#       sums[k] =: x: 0, y: 0, items: 0 }
#
#     # Find the closest centroid for each point. */
#     for (p = 0 p < ps ++p):
#
#       distances = sortBy(centroids, function (centroid):
#           return distance(centroid, points[p])
#         })
#
#       closestItem = distances[0]
#       k = closestItem.k
#
#       # When the point is not attached to a centroid or the point was attached to some other centroid before,
#         the result differs from the previous iteration. */
#       if (typeof points[p].k  !== 'number' || points[p].k !== k)
#         converged = false
#
#       # Attach the point to the centroid */
#       points[p].k = k
#
#       # Add the points' coordinates to the sum of its centroid */
#       sums[k].x += points[p].x
#       sums[k].y += points[p].y
#
#       ++sums[k].items
#     }
#
#     # Re-calculate the center of the centroid. */
#     for (k = 0 k < ks ++k):
#       if (sums[k].items > 0):
#         centroids[k].x = sums[k].x / sums[k].items
#         centroids[k].y = sums[k].y / sums[k].items
#       }
#       centroids[k].items = sums[k].items
#     }
#   }
#
# }
#
# get = function (data, options):
#
#   ks = options.k
#     , runs = options.runs
#     , normalize = options.normalize
#     , xAttribute = options.xAttribute
#     , yAttribute = options.yAttribute
#     , points = data
#     , result = []
#     
#
#   if (typeof xAttribute === 'string' && xAttribute.length > 0
#     && typeof yAttribute === 'string' && yAttribute.length > 0):
#     # prepare data: add x, y property */
#     for (p = 0, ps = data.length p < ps p++):
#       points[p].x = data[p][xAttribute]
#       points[p].y = data[p][yAttribute]
#     }
#   }
#
#   if (normalize)
#     doNormalize(points)
#
#   for (run = 0 run < runs run++):
#
#     # stores result of each run */
#     result[run] =: centroids: [], sum: Infinity }
#
#     # inital guess */
#     centroids = kmeansplusplus(points, ks)
#
#     # store initial centroids from kmeans++ in order to re-run */
#     for(k = 0 k < ks k++):
#       result[run].centroids[k] =:
#         x: centroids[k].x,
#         y: centroids[k].y
#       }
#     }
#
#     # run kmeans */
#     kmeans(points, centroids)
#
#     # calculate differences */
#     result[run].sum = sumSquaredDifferences(points, centroids)
#
#   }
#
#   # find best result */
#   result.sort(function (a, b):
#     return a.sum - b.sum
#   })
#
#   # re-use initial centroids produced by kmeans++ from best run */
#   centroids = []
#   for (k = 0 k < ks k++):
#     centroid =:
#         x: result[0].centroids[k].x
#       , y: result[0].centroids[k].y
#       , k: k
#     }
#     centroids[k] = centroid
#   }
#
#   # run again with best initial centroids */
#   kmeans(points, centroids)
#
#   return sumSquaredDifferences(points, centroids)
#
# }
#
# return:
#   get: get
# }
#
# }())
#
#
# #
#   Simple, deterministic herd structure model
#
#   LICENSE
#
#   Copyright 2014 Jan Vaillant   <jan.vaillant@zalf.de>
#   Copyright 2014 Lisa Baldinger <lisa.baldinger@boku.ac.at>
#
#   Distributed under the MIT License. See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT
#
#   Any publication for which this file or a derived work is used must include an a reference to:
#
#   Vaillant, J. and Baldinger, L. 2016.
#   Application note: An open-source JavaScript library to simulate dairy cows and young stock,
#   their growth, requirements and diets.
#   Computers and Electronics in Agriculture, Volume 120, January 2016, Pages 7–9
#
#   TODO
#
#     - add calving pattern option (seasonal)
#     - add parity 4 (>3) to output
# */
#
# dairy = dairy ||:}
#
# dairy.herd = (function ():
#
# pow = math.pow
#   , round = math.round
#   , floor = math.floor
#   , ceil = math.ceil
#   , IT_MIN = 1e2 # min iterations */
#   , IT_MAX = 1e6 # max. iterations */
#   , WEEKS_IN_MONTH = 30.5 / 7
#   
#
# # constant parameters with default values */
# cons =:
#     ageFirstCalving: 24
#   , femaleCalfRate: 0.47
#   , stillBirthRate: 0.07
#   , youngStockCullRate: 0.155
#   , replacementRate: 0.30
#   , calvingInterval: 12.0
#   , herdSize: 100
#   , gestationPeriod: 9.0
#   , dryPeriode: 2.0
# }
#
# # variables */
# vars =:
#     # stores cow object of cows of same age in month per index
#       age is month after first calving
#      :
#           no:   no. of cows
#         , lac:  lactation no.
#         , dry:  if cow is dry
#         , WG:   week of gestation
#         , WL:   week of lactation
#       } */
#     cows: []
#     # no. of young stock per age month since birth */
#   , young: []
#     # no. of cows */
#   , noCows: 0
#   , heifersBought: []
#   , heifersSold: []
#   , lac: []
#   , sim: []
# }
#
# #
#   run simulation until herd structure does not change anymore (or no. cows equals zero)
#   returns an array of with young stock count per age month and cows with
#
#   lac [#]     lactation no.
#   dry [bool]  if cow is dry
#   WG  [#]     week of gestation
#   WL  [#]     week of lactation
#   age [month]
#
#   initialize parameters (object)
#
#   ageFirstCalving     [month]
#   femaleCalfRate      [-]     fraction female calfes of all calves born
#   stillBirthRate      [-]     fraction of dead born calves
#   youngStockCullRate  [-]     fraction of young stock that do not make it to 1st lactation
#   replacementRate     [-]     fraction of cows replaced each year
#   calvingInterval     [month] month inbetween clavings
#   herdSize            [#]     no. of cows in herd
#   gestationPeriod     [month] length gestation period
#   dryPeriode          [month] length dry period
# */
#
# get = function (options):
#
#   # overwrite default default values if provided and valid */
#   for (prop in options):
#     if (options.hasOwnProperty(prop))
#       cons[prop] = (typeof options[prop] === 'number' && !isNaN(options[prop])) ? options[prop]: cons[prop]
#   }
#
#   # reset values */
#   vars.cows = []
#   vars.young = []
#   vars.noCows = 0
#   vars.heifersBought = []
#   vars.heifersSold = []
#   vars.sim = []
#
#   # varriable shortcuts */
#   ci = cons.calvingInterval
#     , hs = cons.herdSize
#     , dp = cons.dryPeriode
#     , gp = cons.gestationPeriod
#     , sb = cons.stillBirthRate
#     , yc = cons.youngStockCullRate
#     , fc = cons.femaleCalfRate
#     , ac = cons.ageFirstCalving
#     , rr = cons.replacementRate
#     , cows = vars.cows
#     , young = vars.young
#     , converged = false
#     , its = 0 # no. iterations */
#     
#
#   # initialize cow array with some meaningfull values to have a starting point
#     cows at age ageFirstCalving + m within calving interval. eqal distribution of status througout calvingInterval */
#   l = 0
#   while (l < 4): # just set cows up to lactation 4 (could be any) */
#
#     for (m = 0 m < ci m++):
#       cows[m + l * (ci - 1)] =:
#           no: (hs / ci) / 4 # devide by 4 because we only initialize for cows till fourth lactation */
#         , lac: l + 1
#         , dry: (m >= ci - dp) ? true: false
#         , WG: (m >= ci - gp) ? (ci - gp) * WEEKS_IN_MONTH: 0
#         , WL: (m >= ci - dp) ? 0: m * WEEKS_IN_MONTH
#         , age: ac + ci * (l - 1) + m
#       }
#       vars.noCows += (hs / ci) / 4
#     }
#
#     l++
#   }
#
#   # Initialize young stock array. Apply death rate equally distributed as compound interest:
#     K_interest = K_start * (1 + p / 100)^n <=> p / 100 = (K_interest / K_start)^(1/n) - 1
#     K_start = (hs / ci) *  (1 - sb) * fc */
#   young[0] = (hs / ci) *  (1 - sb) * fc * pow(1 - yc, 1 / ac)
#   for (m = 1 m < ac m++)
#     young[m] = young[m - 1] * pow(1 - yc, 1 / ac) # no. young stock per age month */
#
#   # loop until converged i.e. avg. lactation within herd with no. cows equals herd size does not change anymore.
#     Each iteration step equals one month */
#   while (!converged):
#
#     # remove culled young stock */
#     for (y = 0, ys = young.length y < ys y++)
#       young[y] = young[y] * pow(1 - yc, 1 / ac)
#
#     # replacement per month add newly replaced animals to the beginning of the array
#       all age classes within herd are equally replaced */
#
#     newFemaleCalves = 0
#     if (young[young.length - 1] > 0 ): // heifers available
#       # add new calves to young cattle */
#       # from heifers */
#       newFemaleCalves += young[ac - 1] * (1 - sb) * fc
#       # from cows */
#     }
#
#     vars.noCows = 0
#     # start at age group previously c = 0 */
#     for (c = 0, cs = cows.length c < cs c++):
#
#       cow = cows[c]
#
#       if (cow.no > 0):
#
#         # replacement */
#         cow.no = cow.no * (1 - (rr / 12)) // avg monthly replacement
#         cow.age++
#
#         // update pregnancy, dry ...
#         if (!cow.dry):
#           cow.WL += WEEKS_IN_MONTH
#           if (cow.WG > 0):
#             cow.WG += WEEKS_IN_MONTH
#           } else:
#             if (cow.WL > (ci - gp) * WEEKS_IN_MONTH)
#             cow.WG = WEEKS_IN_MONTH
#           }
#           # check if now dry */
#           if (cow.WL > (ci - dp) * WEEKS_IN_MONTH):
#             cow.WL = 0
#             cow.dry = true
#           }
#         } else: // dry cows
#           cow.WG += WEEKS_IN_MONTH
#           # check if cow calved */
#           if (cow.WG > gp * WEEKS_IN_MONTH):
#             newFemaleCalves += cow.no * (1 - sb) * fc
#             cow.lac += 1
#             cow.dry = false
#             cow.WG = 0
#             cow.WL = 0
#           }
#         }
#
#       }
#
#       vars.noCows += cow.no
#
#     } // cows loop
#
#     # no. available heifers form young stock */
#     noHeifers = young.pop()
#     # move only the no. of heifers that are needed to keep/reach total herdSize */
#     noHeifersToHerd = (vars.noCows < hs) ? ((hs - vars.noCows < noHeifers) ? (hs - vars.noCows): noHeifers): 0
#     vars.heifersSold.unshift(noHeifers - noHeifersToHerd)
#
#     noHeifersBought = 0
#     if (noHeifersToHerd < hs - vars.noCows):
#       noHeifersToHerd = hs - vars.noCows
#       noHeifersBought = hs - vars.noCows + noHeifersToHerd
#     }
#     vars.heifersBought.unshift(noHeifersBought)
#
#     cows.unshift({
#         no: noHeifersToHerd
#       , lac: 1
#       , dry: false
#       , WG: 0
#       , WL: 0
#       , age: ac
#     })
#
#     vars.noCows += noHeifersToHerd
#
#     # add new female calves at beginning of array and apply culling rate */
#     young.unshift(newFemaleCalves * pow(1 - yc, 1 / ac))
#
#     # calculate cows per lactation */
#     vars.lac = []
#     for (c = 0, cs = cows.length c < cs c++):
#       if (!vars.lac[cows[c].lac - 1])
#         vars.lac[cows[c].lac - 1] = 0
#       vars.lac[cows[c].lac - 1] += cows[c].no
#     }
#
#     lacSum = 0
#     # calculate avg. lactation */
#     for (l = 0, ls = vars.lac.length l < ls l++):
#       lacSum += vars.lac[l] * (l + 1)
#     }
#
#     # debug max. lac 20 */
#     for (l = 0 l < 20 l++):
#       if (!vars.sim[l])
#         vars.sim[l] = []
#       no = vars.lac[l]
#       vars.sim[l].push(no ? no: 0)
#     }
#
#     if ((its > IT_MIN && round(vars.noCows) === hs && math.round(avg_lac * 1e6) === round(lacSum / vars.noCows * 1e6))
#       || its > IT_MAX || round(vars.noCows) === 0 || isNaN(vars.noCows)):
#       converged = true
#     }
#
#     avg_lac = lacSum / vars.noCows
#     its++
#
#   } # simulation loop */
#
#   herd =:
#       cowsPerLac: []
#     , cows: []
#     , sim: vars.sim
#     , heifersBought: round(vars.heifersBought[0])
#     , heifersSold: round(vars.heifersSold[0])
#     , young: []
#   }
#
#   # add young stock */
#   for (i = 0, is = vars.young.length i < is i++)
#     herd.young.push({ age: i + 1, no: round(vars.young[i]) })
#
#   # we need only cows of parity 1, 2 or >2. Code below as option? */
#   // sum = 0
#   // for (l = 0, ls = vars.lac.length l < ls l++):
#   //   if (sum === hs)
#   //     break
#   //   if (sum + ceil(vars.lac[l]) > hs)
#   //     herd.cowsPerLac[l] = hs - sum
#   //   else
#   //     herd.cowsPerLac[l] = ceil(vars.lac[l])
#   //   sum += herd.cowsPerLac[l]
#   // }
#
#   herd.cowsPerLac[0] = round(vars.lac[0])
#   herd.cowsPerLac[1] = round(vars.lac[1])
#   herd.cowsPerLac[2] = hs - (herd.cowsPerLac[0] + herd.cowsPerLac[1])
#
#   for (l = 0, ls = herd.cowsPerLac.length l < ls l++):
#
#     DPP_increment = ci * 30.5 / ((herd.cowsPerLac[l] === 1) ? math.random() * ci: herd.cowsPerLac[l])
#     DPP = DPP_increment * 0.5
#
#     for (c = 0, cs = herd.cowsPerLac[l] c < cs c++):
#
#       herd.cows.push({
#           DPP: round(DPP)
#         , isDry: (DPP > 30.5 * (ci - dp)) ? true: false
#         , DIM: (DPP > 30.5 * (ci - dp)) ? 0: round(DPP)
#         , DG: (DPP - 30.5 * (ci - gp) > 0) ? round(DPP - 30.5 * (ci - gp)): 0
#         , AGE: round(ac + l * ci + DPP / 30.5)
#         , AGE_days: round((ac + l * ci) * 30.5 + DPP)
#         , P: l + 1
#       })
#
#       DPP += DPP_increment
#
#     }
#
#   }
#
#   return herd
#
# }
#
# return:
#   get: get
# }
#
# }())
#
#
# #
#   Feed intake of cows and young stock is predicted according to the French fill value system described in Agabriel (2010).
#
#   The general functional principal of the INRA fill value system is as follows: The sum of all fill values of the feeds
#   equals the intake capacity of the animal. While the intake capacity of the animals is based on animal-related
#   parameters, the fill values of the feeds are based on feed-related parameters.
#
#   Although not mentioned in Delagarde et al. (2011), we assume that the feed intake restrictions that apply for
#   grazing dairy cows also apply for grazing heifers, because they are based on non-nutritional factors linked to sward
#   availability and grazing management, not on nutritional factors linked to animal characteristics.
#
#   The prediction of feed intake at grazing uses a simplified GrazeIn algorithm.
#
#   GrazeMore, "Improving sustainability of milk production systems in the European Union through increasing reliance on
#   grazed pasture" was an EU research project that ran from 2000-2004. It involved the development of a grazing decision
#   support system to assist farmers in improving the use of grazed grass for milk production. In order to build the DSS,
#   a European herbage growth prediction model and a European herbage intake prediction model were produced. Therefore
#   GrazeIn is the only currently available intake prediction for grazing cows that is based on European data.
#
#   The feed intake prediction in GrazeIn is based on the French INRA fill unit system and adapted to grazing dairy cows.
#   The authors argue that because European cows don´t graze all year long and are often supplemented, a general model of
#   intake is needed rather than one specialized on indoor feeding or grazing.
#
#   Because GrazeIn in based on the INRA fill value system, in some cases equations from Agabriel (2010) are used.
#
#   Fill values (FV) for cows are expressed in the unit LFU, lactating fill unit (UEL, unite encombrement lait) and CFU,
#   cattle fill unit (UEB, unite encombrement bovin) for young stock.
#
#   REFERENCES
#
#   Faverdin, P., Baratte, C., Delagarde, R. and Peyraud, J.L. 2011. GrazeIn: a model of herbage intake and milk production
#   for grazing dairy cows. 1. Prediction of intake capacity, voluntary intake and milk production during lactation. Grass
#   and Forage Science 66(1):29-44.
#
#   Delagarde, R., Faverdin, P., Baratte, C. and Peyraud, J.L. 2011a. GrazeIn: A model of herbage intake and milk production
#   for grazing dairy cows. 2. Prediction of intake under rotational and continuously stocked grazing management. Grass and
#   Forage Science 66(1):45–60.
#
#   Agabriel, J. (2010). Alimentation des bovins, ovins et caprins. Besoins des animaux - Valeurs des aliments. Tables INRA
#   2010. Editions Quae, France.
#
#   LICENSE
#
#   Copyright 2014 Jan Vaillant   <jan.vaillant@zalf.de>
#   Copyright 2014 Lisa Baldinger <lisa.baldinger@boku.ac.at>
#
#   Distributed under the MIT License. See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT
#
#   Any publication for which this file or a derived work is used must include an a reference to:
#
#   Vaillant, J. and Baldinger, L. 2016.
#   Application note: An open-source JavaScript library to simulate dairy cows and young stock,
#   their growth, requirements and diets.
#   Computers and Electronics in Agriculture, Volume 120, January 2016, Pages 7–9
#
#   TODO
#
#   - PLPOT in IC and GSR: is it zero for dry cows or still PLPOT?
# */
#
# dairy = dairy ||:}
#
# dairy.intake = (function ():
#
# exp = math.exp
#   , log = math.log
#   , pow = math.pow
#   , min = math.min
#   , Σ = function (a):
#       sum = 0
#       for (i = 0, is = a[0].length i < is i++)
#         sum += a[0][i] * a[1][i]
#       return sum
#     }
#   
#
# function is_null_or_undefined (x):
#   return x === null || x === undefined
# }
#
#
# #
#   TODO: Funktion rätselhaft, da DMI = Fs + Cs + HI_g
#
#   DMI   [kg]  dry matter intake
#   Fs    [kg]  array of feeds
#   FVs_f [LFU] array of forage fill values
#   Cs    [kg]  array of concentrates
#   Cs_f  [LFU] array of concentrate fill values
#   FV_h  [LFU] herbage fill value
#   HI_r  [-]   relative herbage intake (0-1)
#   HI_g  [kg]  herbage intake at grazing
# */
#
# DMI = function (Fs, FVs_f, Cs, FVs_c, FV_h, HI_r, HI_g):
#
#   DMI = 0
#     , DMI_f = Σ([Fs, FVs_f])
#     , DMI_c = Σ([Cs, FVs_c])
#     
#
#   DMI = DMI_f + DMI_c + (FV_h/HI_r * HI_g)
#
#   return DMI
#
# }
#
# #
#   Agabriel (2010), eqs. 2.3 & 4.5
#
#   Equation to calculate the intake capacity.
#
#   The intake capacity of the cow is not calculated acc. to Faverdin et al. (2011), because the appearance of MPprot
#   (potential milk production modified by protein intake) is problematic since protein intake is unkown at the time of
#   feed intake prediction. Instead, the previous Agabriel (2010) version is used:
#
#   In GrazeIn, Pl_pot represents the potential milk yield of a cow, not the actual milk yield. This is done in order
#   to avoid milk yield driving feed intake (pull-situation). In SOLID-DSS, values for milk yield are taken from the
#   lactation curves modelled within the herd model. These lactation curves are based on input by the user, and thereby
#   represent average milk yields instead of actual ones, so they can be interpreted as a potential under the given
#   circumstances.
#
#   IC    [LFU or CFU]  intake capacity ~ DMI @ FV = 1
#   BW    [kg]          body weight
#   PLPOT [kg day-1]    milk yield, potential
#   BCS   [-]           body condition score (1-5)
#   WL    [week]        week of lactation
#   WG    [week]        week of gestation (0-40)
#   AGE   [month]       age in month
#   p     [#]           parity
# */
#
# IC = function (BW, PLPOT, BCS, WL, WG, AGE, p):
#
#   IC = 0
#
#   if (p > 0): # cows */
#
#     IC = (13.9 + (BW - 600) * 0.015 + PLPOT * 0.15 + (3 - BCS) * 1.5) * IL(p, WL) * IG(WG) * IM(AGE)
#
#   } elif (p === 0): # young stock */
#
#     if (BW <= 150)
#       IC = 0.039 * pow(BW, 0.9) + 0.2
#     elif (150 < BW <= 290)
#       IC = 0.039 * pow(BW, 0.9) + 0.1
#     else
#       IC = 0.039 * pow(BW, 0.9)
#
#   }
#
#   return IC
#
# }
#
# #
#   Agabriel (2010) eq. 2.3f
#
#   The equation for the index of lactation. .
#
#   IL  [-]     index lactation (0-1)
#   p   [#]     parity
#   WL  [week]  week of lactation
# */
#
# IL = function IL(p, WL):
#
#   # if cow is dry IL = 1 */
#   IL = 1
#
#   if (p === 1 && WL > 0)
#     IL = 0.6 + (1 - 0.6) * (1 - exp(-0.16 * WL))
#   elif (p > 1 && WL > 0)
#     IL = 0.7 + (1 - 0.7) * (1 - exp(-0.16 * WL))
#
#   return IL
#
# }
#
# #
#   Agabriel (2010) eq. 2.3f
#
#   The equation for the index of gestation.
#
#   IG  [-]     index gestation (0-1)
#   WG  [week]  week of gestation (0-40)
# */
#
# IG = function (WG):
#
#   return 0.8 + 0.2 * (1 - exp(-0.25 * (40 - WG)))
#
# }
#
# #
#   Agabriel (2010) eq. 2.3f
#
#   The equation for the index of maturity.
#
#   IM  [-]     index maturity (0-1)
#   AGE [month] month
# */
#
# IM = function (AGE):
#
#   return -0.1 + 1.1 * (1 - exp(-0.08 * AGE))
#
# }
#
# #
#   Agabriel (2010), Table 8.1.
#
#   The general equation for calculating forage fill values.
#
#   The QIL and QIB values are calculated in feed.evaluation, details see there.
#
#   FV_f  [LFU or CFU kg-1 (DM)] forage fill value (is LFU for cows and CFU for young stock)
#   QIX   [g kg-1]               ingestibility in g per kg metabolic live weight (is QIL for cows and QIB for young stock)
#   p     [#]                    parity
# */
#
# FV_f = function (QIX, p):
#
#   if (p > 0) # cows */
#     return 140 / QIX
#   else       # young stock */
#     return 95 / QIX
#
# }
#
# #
#   Faverdin et al. (2011) eq. 11
#
#   Equation for calculating concentrate fill value.
#
#   One of the factors influencing the concentrate fill value is the fill value of the forage base.
#   Because the total diet is unknown prior to the allocation of feeds, the weighted mean of the FV of all available
#   forages for the group of cows and the time period in question is used for FV_fr.
#
#   FV_c  [LFU or CFU kg-1 (DM)] concentrate fill value (lactating fill unit, unite encombrement lait)
#   FV_fs [LFU]                  weighted FV of forages in ration
#   GSR   [-]                    global substitution rate (0-1)
# */
#
# FV_c = function (FV_fs, GSR):
#
#   return FV_fs * GSR
#
# }
#
# #
#   Equation to estimate the fill value of forages in a diet from the cow's requirements prior to ration optimization.
#   This is based on the fact that on average a feed's fill value will descrease with increasing energy content. The
#   estimated FV_fs is used to calculate a concentrate fill value (see FV_cs). We need it if we what to keep the diet LP
#   linear.
#   The regression was calculated from all forages available in Agabriel 2010. Details and R script in ../doc/FV_f.
#
#   FV_fs_diet  [LFU or CFU kg-1 (DM)] Estimated fill value of forages in diet
#   E_fs        [UFL]           Total energy content of forages in diet
#   FV_fs       [LFU]           Total fill values of forages in diet
#   p           [#]             parity
# */
#
# FV_fs_diet = function (E_fs, FV_fs, p):
#
#   if (p > 0)
#     return -0.489 * E_fs / FV_fs + 1.433
#   else
#     return -0.783 * E_fs / FV_fs + 1.688
#
# }
#
# #
#   Estimate an average concentrate fill value. We assume that requirements are met i.e. cows with BWC >= 0 have a zero
#   energy balance.
#
#   TODO:
#     - simplify to an equation?
#     - use this as a better estimate of DMI instead of DMI = IC (FV ~ 1)?
#
#   FV_cs_diet  [LFU kg-1 (DM)] estimated fill value of concentrates in diet
#   E_req       [UFL]           Energy requirements of a cow (in UFL!)
#   IC          [LFU]           Intake capacity of a cow
#   c_mx        [kg kg-1]       Maximum fraction (DM) of concentrates in diet (optional, defaults to 0.5 which is the
#                               range the INRA system is applicable)
#   PLPOT       [kg day-1]      milk yield, potential
#   p           [#]             parity
#   BWC         [kg]            body weight change
# */
#
# FV_cs_diet = function (E_req, IC, c_mx, PLPOT, p, BWC):
#
#   FV_cs_diet = 0
#
#   if (is_null_or_undefined(c_mx) || c_mx > 0.5)
#     c_mx = 0.5
#
#   c = 0       # fraction of conc. in diet [kg (DM) kg-1 (DM)] */
#     , c_kg = 0    # kg conc. in diet */
#     , E_f = E_req # energy requirements covered by forage */
#     , IC_f = IC   # IC covered by forage */
#     , c_fvs = []  # store conc. fill values */
#     , c_fv = 0    # estimated conc. fill value */
#     , f_fv = 0    # estimated forage fill value */
#     , s = 0       # substitution rate */
#     
#
#   # fixed to a max. UFL / UEL value observed in feeds */
#   if (E_f / IC_f > 1.15)
#     E_f = E_req = IC_f * 1.15
#
#   while (true):
#
#     # staring from a diet with zero kg conc. we add conc. till we reach c_mx */
#     f_fv = FV_fs_diet(E_f, IC_f, p)
#     s = GSR(c_kg, DEF(E_f, IC_f), PLPOT, p, BWC, f_fv)
#     c_fv = f_fv * s
#     c = c_kg / (IC_f / f_fv + c_kg)
#
#     if (c >= c_mx)
#       break
#
#     c_fvs.push(c_fv)
#
#     # add concentrate to the diet */
#     c_kg += 0.5
#     # we assume the concentrate's UFL content is 1.05. In fact the result is not very sensitive to UFL of conc. */
#     E_f = E_req - c_kg * 1.05
#     IC_f = IC - c_kg * c_fv
#
#   }
#
#   # average */
#   FV_cs_diet = c_fvs.reduce(function (a, b, i, array): return a + b / array.length }, 0)
#
#   return FV_cs_diet
#
# }
#
# #
#   Agabriel (2010) eq. 2.25
#
#   DEF is the average energy density of the forages in the diet, which is calculated as the weighted mean of all
#   available forages for the group of cows and the time period in question.
#
#   DEF     [UFL LFU-1 or CFU-1]    average energy density of the forages in the diet (can be slightly higher than 1)
#   UFL_fs  [UFL kg-1 (DM)]         sum of the energy contents of all available forages
#   FV_fs   [LFU or CFU kg-1 (DM)]  sum of the fill values of all available forages
# */
#
# DEF = function (UFL_fs, FV_fs):
#
#   return UFL_fs / FV_fs
#
# }
#
# #
#   Agabriel (2010) eq. 2.26 &  Table 1.2
#
#   Both in Agabriel (2010) and in GrazeIn, concentrate fill values not only vary with the fill value of the forage base,
#   but also with the amount of concentrates, the milk yield of the cow and the energy balance of the cow, which are
#   all incorporated into the calculation of the global substitution rate (GSR). Consequently, concentrate fill values
#   and feed intake are calcalated iteratively until the system converges.
#   In SOLID-DSS, no iterative calculation is possible because all fill values must stay constant when the linear
#   programming starts to allocate feeds. Therefore the simplified version of calculating GSR that can be found in
#   Agabriel (2010) was chosen. According to this version, there is one calculation fo GSR when cows are not mobilizing,
#   and a different calculation when cows are mobilizing.
#
#   For QI_c, the maximum of concentrates the user is willing to feed is used, because we assume that those cows that are
#   mobilizing will receive the maximum concentrate supplementation.
#
#   For dairy heifers, the global substitution rate also depends on the fill value of the forage base. Agabriel (2010)
#   doesn´t supply equations for calculating GSR, but gives a Table (1.2) with discrete values. Based on these values, a
#   linear regression for the calculation of GSR was produced which is valid for fill values of the forage base between
#   0.95 and 1.4 and which assumes a concentrate proportion of 15%. The coefficient of determination of the linear
#   regression is 0.99.
#
#   TODO: replace BWC with something like "energy balance of the cow is negative"
#
#   GSR   [-]                   global substitution rate (0-1)
#   QI_c  [kg (DM)]             total amount of concentrates that are fed
#   DEF   [UFL LFU-1 or CFU-1]  average energy density of the forages in the diet (can be slightly higher than 1)
#   PLPOT [kg day-1]            milk yield, potential
#   p     [#]                   parity
#   BWC   [kg]                  body weight change
#   FVF   [CFU kg-1]            forage fill value in diet (only needed if p = 0 i.e. youg stock)
# */
#
# GSR = function (QI_c, DEF, PLPOT, p, BWC, FVF):
#
#   GSR = 1
#     , GSR_zero = 0.55
#     , d = (p > 1 ? 1.10: 0.96)
#     
#
#   if (p === 0 && !is_null_or_undefined(FVF)): # young stock */
#
#     GSR = 1.765 - 1.318 * FVF
#
#   } else: # cows */
#
#     # should be larger 0 (dry cows have a pot. milk yield as well) */
#     if (PLPOT <= 0)
#       PLPOT = 1
#
#     GSR_zero = d * pow(PLPOT, -0.62) * exp(1.32 * DEF)
#
#     if (BWC < 0) # energy balance of the cow is negative, irrespective of the reason */
#       GSR = -0.43 + 1.82 * GSR_zero + 0.035 * QI_c - 0.00053 * PLPOT * QI_c
#     else
#       GSR = GSR_zero
#
#   }
#
#   return GSR
#
# }
#
# #
#   Herbage intake prediction with GrazeIn:
#   IC, FV_h -> HI_v
#   H -> VI_max
#   TAP, VI_max -> HI_r_tap
#
#   Continuous grazing:
#   H -> HI_r_ssh
#   HI_r_ssh, HI_v -> HI_g1
#   HI_r_tap, HI_r_ssh, HI_v -> HI_g2
#   HI_g1, HI_g2 -> HI_g
#
#
#   Rotational grazing:
#   A, HM_2, HGR, RT, NCow -> HA_2
#   HA_2, HI_v -> HA_r -> HI_r_ha
#   HI_r_ha, HI_v -> HI_g1
#   HI_r_tap, HI_r_ha, HI_v -> HI_g2
#   HI_g1, HI_g2 -> HI_g
# */
#
#
# #
#   HI_rg [kg (DM) day-1] herbage intake when grazing is rotational
#   IC    [LFU or CFU]    intake capacity ~ DMI @ FV = 1
#   FV_h  [LFU]           fill value herbage
#   A     [m2]            total area of paddock
#   H     [cm]            sward surface height
#   HM_2  [kg (DM) ha-1]  pre-grazing herbage mass above 2 cm ground level
#   HGR   [kg (DM) ha-1]  daily herbage growth rate
#   RT    [day]           residence time in the paddock
#   NCow  [#]             number of cows in the herds
#   TAP   [h day-1]       time at pasture
# */
#
# HI_rg = function (IC, FV_h, A, H, HM_2, HGR, RT, NCow, TAP):
#
#   HI_v_ = HI_v(IC, FV_h)
#     , HA_2_ = HA_2(A, HM_2, HGR, RT, NCow)
#     , HA_r_ = HA_r(HA_2_, HI_v_)
#     , HI_r_ha_ = HI_r_ha(HA_r_)
#     , VI_max_ = VI_max(H)
#     , HI_r_tap_ = HI_r_tap(TAP, VI_max_)
#     , HI_g1_ = HI_g1(HI_v_, HI_r_ha_)
#     , HI_g2_ = HI_g2(HI_v_, HI_r_tap_, HI_r_ha_, TAP)
#     
#
#   return HI_g(HI_g1_, HI_g2_)
#
# }
#
# #
#   HI_cg [kg (DM) day-1] herbage intake when grazing is continuous
#   IC    [LFU or CFU]    intake capacity ~ DMI @ FV = 1
#   FV_h  [LFU]           fill value herbage
#   H     [cm]            sward surface height
#   TAP   [h day-1]       time at pasture
# */
#
# HI_cg = function (IC, FV_h, H, TAP):
#
#   HI_v_ = HI_v(IC, FV_h)
#     , VI_max_ = VI_max(H)
#     , HI_r_tap_ = HI_r_tap(TAP, VI_max_)
#     , HI_r_ssh_ = HI_r_ssh(H)
#     , HI_g1_ = HI_g1(HI_v_, HI_r_ssh_)
#     , HI_g2_ = HI_g2(HI_v_, HI_r_tap_, HI_r_ssh_, TAP)
#     
#
#   return HI_g(HI_g1_, HI_g2)
#
# }
#
#
# #
#   Delagarde et al. (2011) eq. 13
#   Equation for relative herbage intake limited by allowance when grazing is rotational.
#
#   When cows are not grazing, all necessary calculations are hereby completed and the feed intake restriction is:
#   IC = sum of fill values of forages and concentrates multiplied with their amount (or share in the diet)
#   When cows are grazing, their herbage intake can be restricted by sward availability or by time at grazing.
#   For calculating the restriction caused by sward availability, there are two different calculations, one for rotational
#   and one for continuous grazing.
#
#   HI_r_ha [-] relative herbage intake limited by herbage allowance when grazing is rotational (0-1)
#   HA_r    [-] relative herbage allowance
# */
#
# HI_r_ha = function (HA_r):
#
#   return 1.08 * (1 - exp(-1.519 * HA_r))
#
# }
#
# #
#   Delagarde et al. (2011) eq. 15
#
#   Equation for calculating herbage intake restricted by sward availability when grazing is continuous.
#
#   HI_r_ssh  [-]   relative herbage intake limited by sward surface height when grazing is continuous (0-1)
#   H         [cm]  sward surface height measured with a sward stick
# */
#
# HI_r_ssh = function (H):
#
#   return -1 + 0.5 * H - 0.233 * log(1 + exp(2 * H - 7.38)) - 0.033 * log(1 + exp(H - 11))
#
# }
#
# #
#   Delagarde et al. (2011) eq. 17
#
#   Herbage intake can also be restricted by time at pasture. If this is the case, it does not matter if grazing is
#   rotational or continuous.
#
#   VI_max    [kg or LFU] maximum voluntary intake depending on available forage TODO: unit of VI_max
#   H         [cm]        sward surface height
# */
#
# VI_max = function (H):
#
#   return 0.058 + 0.0062 * (H - log(1 + exp(H - 22.9)))
#
# }
#
# #
#   Delagarde et al. (2011) eq. 16
#
#   Equation for relative herbage intake limited by time at pasture.
#
#   HI_r_tap  [-]         relative herbage intake limited by time at pasture (0-1)
#   TAP       [h day-1]   time at pasture
#   VI_max    [kg or LFU] maximum voluntary intake depending on available forage TODO: unit of VI_max
# */
#
# HI_r_tap = function (TAP, VI_max):
#
#   HI_r_tap = 1
#
#   if (TAP <= 20)
#     HI_r_tap = (VI_max * TAP) - (VI_max - 0.008) * log(1 + exp(TAP - (0.845 / (VI_max - 0.008))))
#
#   return min(1, HI_r_tap)
#
# }
#
# #
#   The theoretical, maximum intake of herbage when nothing is supplemented and there is no restriction whatsoever can be
#   calculated by dividing the intake capacity with the fill value of herbage.
#
#   HI_v  [kg (DM) day-1] voluntary herbage intake
#   IC    [LFU]           intake capacity
#   FV_h  [LFU]           fill value herbage
# */
#
# HI_v = function (IC, FV_h):
#
#   return IC / FV_h
#
# }
#
# #
#   Delagarde et al. (2011) eq. 14
#
#   Equation for herbage allowance above 2 cm taken.
#
#   In GrazeIn, the available herbage mass is defined as everything above 2 cm above ground, because it is assumed that
#   cows cannot graze the 2 cm closest to the ground.
#
#   HA_2  [kg (DM) ha-1]  herbage allowance above 2 cm
#   A     [m2]            total area of paddock
#   HM_2  [kg (DM) ha-1]  pre-grazing herbage mass above 2 cm ground level
#   HGR   [kg (DM) ha-1]  daily herbage growth rate
#   RT    [day]           residence time in the paddock
#   NCow  [#]             number of cows in the herds
# */
#
# HA_2 = function (A, HM_2, HGR, RT, NCow):
#
#   return A * (HM_2 + (0.5 * HGR * RT)) / (1e4 * RT * NCow)
#
# }
#
# #
#   Delagarde et al. (2011) eq. 12
#
#   Equation for relative herbage allowance taken.
#
#   The relative herhage allowance can be calculated by dividing the available herbage mass above 2 cm above ground with
#   the voluntary herbage intake of the cow.
#
#   HA_r  [-]             relative herbage allowance
#   HA_2  [kg (DM) ha-1]  herbage allowance above 2 cm
#   HI_v  [kg (DM) day-1] voluntary herbage intake
# */
#
# HA_r = function (HA_2, HI_v):
#
#   return  HA_2 / HI_v
#
# }
#
# #
#   Delagarde et al. (2011) eqs. 22,24
#
#   HI_g1   [kg (DM)] intake from grazing (limited by availability)
#   HI_v    [kg (DM)] voluntary herbage intake
#   HI_r    [-]       HI_r_ha (rotational) or HI_r_ssh (continuously)
# */
#
# HI_g1 = function (HI_v, HI_r):
#
#   return  HI_v * HI_r
#
# }
#
# #
#   Delagarde et al. (2011) eqs. 23,25
#
#   HI_g2     [kg (DM)] intake from grazing (limited by time at pasture)
#   HI_v      [kg (DM)] voluntary herbage intake
#   HI_r_tap  [-]       relative herbage intake limited by time at pasture (0-1)
#   HI_r      [-]       HI_r_ha (rotational) or HI_r_ssh (continuously)
#   TAP       [h day-1] time at pasture
# */
#
# HI_g2 = function (HI_v, HI_r_tap, HI_r, TAP):
#
#   return  HI_v * HI_r_tap * (TAP >= 20 ? HI_r: 1)
#
# }
#
# #
#   Delagarde et al. (2011) eq. 21
#
#   HI_g     [kg (DM)] intake from grazing
#   HI_g1    [kg (DM)] herbage intake (limited by limited by availability)
#   HI_g2    [kg (DM)] herbage intake (limited by limited by time at pasture)
# */
#
# HI_g = function (HI_g1, HI_g2):
#
#   return  min(HI_g1, HI_g2)
#
# }
#
# return:
#
#     DMI: DMI
#   , IC: IC
#   , FV_f: FV_f
#   , FV_c: FV_c
#   , FV_fs_diet: FV_fs_diet
#   , FV_cs_diet: FV_cs_diet
#   , GSR: GSR
#   , DEF: DEF
#   , HI_rg: HI_rg
#   , HI_cg: HI_cg
#
# }
#
# }())
#
#
# #
#   Calculate milk yield and solids adjusted for parity requiring estimates for parameters of Wood's lactation curve.
#
#   REFERENCES
#
#   Wood, P.D.P. 1980. Breed variations in the shape of the lactation curve of cattle and their implications for
#   efficiency. Animal Production 31(2):133-141.
#
#   Tyrrell, H.F. and Reid, J.T. 1965. Prediction of the energy value of cow's milk. Journal of Dairy Science 48(9):
#   1215-1223.
#
#   DLG. 2006. Schätzung der Futteraufnahme bei der Milchkuh [Estimating feed intake of dairy cows]. DLG-Information
#   1/2006. DLG-Verlag, Frankfurt/Main, Germany. p. 29.
#
#   LICENSE
#
#   Copyright 2014 Jan Vaillant   <jan.vaillant@zalf.de>
#   Copyright 2014 Lisa Baldinger <lisa.baldinger@boku.ac.at>
#
#   Distributed under the MIT License. See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT
#
#   Any publication for which this file or a derived work is used must include an a reference to:
#
#   Vaillant, J. and Baldinger, L. 2016.
#   Application note: An open-source JavaScript library to simulate dairy cows and young stock,
#   their growth, requirements and diets.
#   Computers and Electronics in Agriculture, Volume 120, January 2016, Pages 7–9
# */
#
# dairy = dairy ||:}
#
# dairy.milk = (function ():
#
# pow = math.pow
#   , exp = math.exp
#   
#
# function is_null_or_undefined (x):
#   return x === null || x === undefined
# }
#
# #
#   DLG (1/2006), Tabelle 7
#
#   Typical lactation milk yield data per yield level [day, milk yield]. May be used to estimate Wood's lactation curve
#   parameters (e.g. with lmfit).
# */
# data =:
#   '6500': [
#     [20 , 29],
#     [40 , 30],
#     [60 , 28],
#     [100, 25],
#     [150, 22],
#     [200, 19],
#     [250, 15],
#     [300, 13],
#     [350, 12]
#   ],
#   '7500': [
#     [20 , 32],
#     [40 , 33],
#     [60 , 32],
#     [100, 29],
#     [150, 26],
#     [200, 22],
#     [250, 18],
#     [300, 15],
#     [350, 13]
#   ],
#   '8500': [
#     [20 , 36],
#     [40 , 37],
#     [60 , 36],
#     [100, 32],
#     [150, 28],
#     [200, 25],
#     [250, 21],
#     [300, 17],
#     [350, 15]
#   ],
#   '9500': [
#     [20 , 39],
#     [40 , 40],
#     [60 , 39],
#     [100, 36],
#     [150, 32],
#     [200, 28],
#     [250, 24],
#     [300, 19],
#     [350, 16]
#   ],
#   '10500': [
#     [20 , 42],
#     [40 , 44],
#     [60 , 43],
#     [100, 39],
#     [150, 35],
#     [200, 31],
#     [250, 27],
#     [300, 21],
#     [350, 18]
#   ],
#   '11500': [
#     [20 , 45],
#     [40 , 48],
#     [60 , 47],
#     [100, 43],
#     [150, 38],
#     [200, 35],
#     [250, 30],
#     [300, 24],
#     [350, 21]
#   ]
# }
#
# #
#   Wood (1980)
#
#   Prediction of milk yield adjusted for parity. Parameter adjustment (b & c) from p.137, table 4.
#
#   Milk production potential (a parameter per parity) is scaled proportionally subject to the cow's size at calving (BW_c / MBW).
#
#   milk  [kg]      Milk yield in week n
#   a     [-]       Scale factor
#   b     [-]       Shape constant
#   c     [-]       Shape constant
#   n     [week]    Week of lactation
#   p     [#]       Parity, defaults to parity > 2
#   BW_c  [kg]      Actual body weight at calving
#   MBW   [kg]      Mature body weight
# */
#
# milk = function (a, b, c, n, p, BW_c, MBW):
#
#   milk = 0
#
#   if (p === 1)
#     milk = BW_c / MBW * a * pow(n, b - 0.0374) * exp((c + 0.0092) * n)
#   elif (p === 2)
#     milk = BW_c / MBW * a * pow(n, b - 0.0253) * exp((c + 0.0000) * n)
#   else # defaults to parity > 2 */
#     milk = a * pow(n, b + 0.0460) * exp((c - 0.0052) * n)
#
#   return milk
#
# }
#
# #
#   Calculate Wood a parameter for fat.
#
#   We don't want to mess around with integrating incomplete gamma functions. Therefore we approximate with a numeric
#   integration and calculate the a parameter from
#
#     fat_average = a * (integrate pow(n, b) * exp(c * n) for n from 0 to 305/7) / 305/7
#     a = fat_average / ((integrate pow(n, b) * exp(c * n) for n from 0 to 305/7) / 305/7)
#
#   If we calculate a here we only need % fat as an input parameter which is usually available.
#
#   fat_a   [%]     Wood fat scale parameter
#   fat_avg [%]     fat average
#   p       [#]     Parity, defaults to parity > 2
#   n_mx    [week]  Week of maximum milk yield
# */
#
# fat_a = function (fat_avg, p, n_mx):
#
#   return fat_avg / fat_avg_305(1, p, n_mx)
#
# }
#
# #
#   Calculate Wood a parameter for protein.
#
#   We don't want to mess around with integrating incomplete gamma functions. Therefore we approximate with a numeric
#   integration and calculate the a parameter from
#
#     protein_average = a * (integrate pow(n, b) * exp(c * n) for n from 0 to 305/7) / 305/7
#     a = protein_average / ((integrate pow(n, b) * exp(c * n) for n from 0 to 305/7) / 305/7)
#
#   If we calculate a here we only need % protein as an input parameter which is usually available.
#
#   protein_a   [%]     Wood protein scale parameter
#   protein_avg [%]     protein average
#   p           [#]     Parity, defaults to parity > 2
#   n_mx        [week]  Week of maximum milk yield
# */
#
# protein_a = function (protein_avg, p, n_mx):
#
#   return protein_avg / protein_avg_305(1, p, n_mx)
#
# }
#
# #
#   Wood (1980)
#
#   Prediction of milk fat adjusted for parity. Parameter adjustment (b & c) from p.137, table 4. It is assumed that the
#   fat minimum occurs six weeks after milk yield peaks.
#
#   fat   [%]     Percent milk fat in week n
#   a     [-]     Scale factor
#   n     [week]  Week of lactation
#   p     [#]     Parity, defaults to parity > 2
#   n_mx  [week]  Week of maximum milk yield
# */
#
# fat = function (a, n, p, n_mx):
#
#   fat = 0
#     , b = -0.1230 # shape constant */
#     , c = 0.0104  # shape constant */
#     
#
#   if (p === 1)
#     b += 0.0168
#   elif (p === 2)
#     b += 0.0320
#   else # defaults to parity > 2 */
#     b += -0.0078
#
#   # adjust for week of milk peak */
#   c = -(b / (4 + n_mx))
#   b = -((6 + n_mx) * c)
#
#   fat = a * pow(n, b) * exp(c * n)
#
#   return fat
#
# }
#
# #
#   Wood (1980)
#
#   Prediction of milk protein adjusted for parity. Parameter adjustment (b & c) from p.137, table 4. It is assumed that
#   the protein minimum occurs six weeks after milk yield peaks.
#
#   protein [%]     Percent milk protein in week n
#   a       [-]     Scale factor
#   n       [week]  Week of lactation
#   p       [#]     Parity, defaults to parity > 2
#   n_mx    [week]  Week of maximum milk yield
# */
#
# protein = function (a, n, p, n_mx):
#
#   protein = 0
#     , b = -0.1274 # shape constant */
#     , c = 0.0107  # shape constant */
#     
#
#   if (p === 1)
#     b += 0.0200
#   elif (p === 2)
#     b += 0.0025
#   else # defaults to parity > 2 */
#     b += -0.0136
#
#   # adjust for week of milk peak */
#   c = -(b / (4 + n_mx))
#   b = -((6 + n_mx) * c)
#
#   protein = a * pow(n, b) * exp(c * n)
#
#   return protein
#
# }
#
# #
#   Wood (1980)
#
#   Day of maximum milk yield: x/dx (a * x^(b-1) * exp(c * x) * (b + c*x)) = 0 -> -b/c
#
#   d_mx  [day]   day max milk
#   b     [-]     Shape constant
#   c     [-]     Shape constant
#   p     [#]     Parity, defaults to parity > 2
#
# */
#
# d_mx = function (b, c, p):
#
#   # in weeks */
#   n_mx = 0
#
#   if (p === 1)
#     n_mx = -((b - 0.0374) / (c + 0.0092))
#   elif (p === 2)
#     n_mx = -((b - 0.0253) / (c + 0.0000))
#   else # defaults to parity > 2 */
#     n_mx = -((b + 0.0460) / (c - 0.0052))
#
#   return n_mx * 7
#
# }
#
# #
#   305 days milk yield.
#
#   milk_305  [kg]      Total milk yield in 305 days
#   a         [-]       Scale factor
#   b         [-]       Shape constant
#   c         [-]       Shape constant
#   p         [#]       Parity, defaults to parity > 2
#   BW_c      [kg]      Actual body weight at calving
#   MBW       [kg]      Mature body weight
# */
#
# milk_305 = function (a, b, c, p, BW_c, MBW):
#
#   milk_305 = 0
#
#   for (day = 1 day < 306 day++)
#     milk_305 += milk(a, b, c, day / 7, p, BW_c, MBW)
#
#   return milk_305
#
# }
#
# #
#   Average 305 days milk fat percent.
#
#   fat_avg_305 [%]     Average fat yield
#   a           [-]     Scale factor
#   p           [#]     Parity, defaults to parity > 2
#   n_mx        [week]  Week of maximum milk yield
# */
#
# fat_avg_305 = function (a, p, n_mx):
#
#   fat_avg_305 = 0
#
#   for (day = 1 day < 306 day++)
#      fat_avg_305 += fat(a, day / 7, p, n_mx)
#
#   return fat_avg_305 / 305
#
# }
#
# #
#   Average 305 days milk protein percent.
#
#   protein_avg_305 [%]     Average protein yield
#   a               [-]     Scale factor
#   p               [#]     Parity, defaults to parity > 2
#   n_mx            [week]  Week of maximum milk yield
# */
#
# protein_avg_305 = function (a, p, n_mx):
#
#   protein_avg_305 = 0
#
#   for (day = 1 day < 306 day++)
#      protein_avg_305 += protein(a, day / 7, p, n_mx)
#
#   return protein_avg_305 / 305
#
# }
#
# #
#   Tyrrell (1965)
#
#   Energy corrected milk. Corrected to F_target and P_target.
#
#   ECM       [kg]  Energy corrected milk
#   F_target  [%]   ECM fat target
#   P_target  [%]   ECM protein target
#   F         [%]   Fat in milk
#   P         [%]   Protein in milk
#   M         [kg]  Milk
# */
#
# ECM = function (F_target, P_target, F, P, M):
#
#   # E [kcal lb-1] energy of one lb milk, Table 4, eq. 2 */
#   E_target = 40.72 * F_target + 22.65 * P_target + 102.77
#     , E = 40.72 * F + 22.65 * P + 102.77
#     
#
#   ECM =  M * E / E_target
#
#   return ECM
#
# }
#
# return:
#     milk: milk
#   , fat: fat
#   , fat_a: fat_a
#   , protein: protein
#   , protein_a: protein_a
#   , d_mx: d_mx
#   , milk_305: milk_305
#   , fat_avg_305: fat_avg_305
#   , protein_avg_305: protein_avg_305
#   , ECM: ECM
#   , data: data
# }
#
# }())
#
#
