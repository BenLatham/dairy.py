#   Dairy diet calculation.
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

import feeds
import math
import pulp as lp

# GLPK 4.53 constants
MODE_MIN = 1  # minimization
MODE_MAX = 2  # maximization

# kind of structural variable:
VAR_CONTINUOUS  = 1  # continuous variable
VAR_INTEGER  = 2  # integer variable
VAR_BINARY  = 3  # binary variable

# type of auxiliary/structural variable: */
BOUND_FREE  = 1  # free (unbounded) variable */
BOUND_LOWER  = 2  # variable with lower bound */
BOUND_UPPER  = 3  # variable with upper bound */
BOUND_DOUBLE  = 4  # double-bounded variable */
BOUND_FIXED  = 5  # fixed variable */


 # solution status: */
STATUS_UNDEF  = 1  # solution is undefined */
STATUS_FEAS   = 2  # solution is feasible */
STATUS_INFEAS = 3  # solution is infeasible */
STATUS_NOFEAS = 4  # no feasible solution exists */
STATUS_OPT    = 5  # solution is optimal */
STATUS_UNBND  = 6  # solution is unbounded */

Infinity = float("inf")

class Options:
    def __init__(self,
                 RNB_ub,
                 RNB_lb,
                 conc_mx,
                 eval_sys,
                 callback):
        self.RNB_ub = RNB_ub
        self.RNB_lb = RNB_lb
        self.conc_mx = conc_mx
        self.eval_sys = eval_sys
        self.callback = callback

class Cow:
    def __init__(self, IC,  FV_c):
        self.IC = IC
        self.req = {
            "de":{
                "total":{
                    "P":1,
                    "E":2
                }
            },
            "fi":{
                "total":{
                    "P":3,
                    "E":4
                }
            },
            "gb":{
                "total":{
                    "P":5,
                    "E":6
                }
            },
            "fr":{
                "total":{
                    "P":7,
                    "E":8
                }
            }
        }
        self.FV_c = FV_c


def get (cow, feeds, options):

#   callback = options.callback
    RNB_ub = options.RNB_ub
    RNB_lb = options.RNB_lb
    conc_mx = options.conc_mx  # should not be larger than 0.5 */
    eval_sys = options.eval_sys

    LP ={
        "name": "name",
        "objective":{
            "direction": MODE_MAX,
            "name": "obj",
            "vars": []
        },
        "subjectTo": [],
        "bounds": []
      }


    LP["objective"]["vars"].append({
        "name": 'dE',
        "coef": -10
    })

    LP["objective"]["vars"].append({
        "name": 'sE',
        "coef": -10
    })

    LP["objective"]["vars"].append({
        "name": 'dP',
        "coef": -1
    })

    LP["objective"]["vars"].append({
        "name": 'sP',
        "coef": -1
    })


    #recursive_print(0, LP)
    subjectTo = []

    E_const = {
        "name": 'E',
        "vars": [
            {"name": 'dE', "coef": 1},
            {"name": 'sE', "coef": -1},
        ],
        "bounds": {"type": BOUND_FIXED, "ub": 1.0, "lb": 1.0}
    }


    P_const = {
        "name": 'P',
        "vars": [
            {"name": 'dP', "coef": 1},
            {"name": 'sP', "coef": -1},
        ],
        "bounds": {"type": BOUND_FIXED, "ub": 1.0, "lb": 1.0}
    }


    RNB_bnd_type = -1
    if RNB_lb == RNB_ub:
        RNB_bnd_type = BOUND_FIXED
    elif RNB_lb == -Infinity and RNB_ub == Infinity:
        RNB_bnd_type = BOUND_FREE
    elif RNB_lb == -Infinity and RNB_ub < Infinity:
        RNB_bnd_type = BOUND_UPPER
    elif RNB_lb > -Infinity and RNB_ub == Infinity:
        RNB_bnd_type = BOUND_LOWER
    elif RNB_lb != -Infinity and RNB_ub != Infinity:
        RNB_bnd_type = BOUND_DOUBLE


    RNB_const = {
        "name": 'RNB',
        "vars": [],
        "bounds": {
            "type": RNB_bnd_type,
            "ub": RNB_ub,
            "lb": RNB_lb
        }
    }

    IC_const = {
        "name": 'IC',
        "vars": [],
        "bounds": {"type": BOUND_FIXED, "ub": cow.IC, "lb": cow.IC}
    }
    
    CC_const = {
        "name": 'CC',
        "vars": [],
        "bounds": {"type": BOUND_UPPER, "ub": 0, "lb": 0}
    }


    # add selected feeds */
    for feed in feeds:
        if (conc_mx == 0 and feed["type"] == 'concentrate'):
            continue

        E_const["vars"].append({
            "name": 'F_' + str(feed["id"]),
            "coef": feed[eval_sys]["E"] / cow.req[eval_sys]["total"]["E"]
        })

        P_const["vars"].append({
            "name": 'F_' + str(feed["id"]),
            "coef": feed["de"]["P"] / cow.req["de"]["total"]["P"]
        })

        RNB_const["vars"].append({
            "name": 'F_' + str(feed["id"]),
            "coef": feed["de"]["RNB"]
        })

        if (feed["type"] == 'concentrate'):

            IC_const["vars"].append({
                "name": 'F_' + str(feed["id"]),
                "coef": cow.FV_c
            })

            CC_const["vars"].append({
                "name": 'F_' + str(feed["id"]),
                "coef": (1 - conc_mx)/conc_mx
            })

        else:
            IC_const["vars"].append({
                "name": 'F_' + str(feed["id"]),
                "coef": """feed["fr"].FV"""
        })

        CC_const["vars"].append({
            "name": 'F_' + str(feed["id"]),
            "coef": -1
        })


    subjectTo.append(E_const)
    subjectTo.append(P_const)
    subjectTo.append(RNB_const)
    subjectTo.append(IC_const)
    if (conc_mx > 0):
        subjectTo.append(CC_const)

    LP["subjectTo"] = subjectTo
    return LP
#
#   if (ENVIRONMENT_IS_NODE):
#     return: lp: LP, glpk: glpk.solve(LP, STATUS_MSG_ALL) }
#   } elif (ENVIRONMENT_IS_WEB and typeof callback == 'function'):
#     glpk.postMessage({ lp: LP, msg_lev: STATUS_MSG_DBG })
#     return LP
#   }
#
# }
#
# return:
#   get: get,
#   glpk: glpk
# }
#
# }())

def recursive_print(indent, item_to_print):
    if isinstance(item_to_print, dict):
        print("")
        for key, value in item_to_print.items():
            print("    "*indent, key, end=":")
            if isinstance(value, (dict,list)):
                recursive_print(indent + 1, value)
            else:
                print(value)
    else:
        for item in item_to_print:
            if isinstance(item, (dict,list)):
                recursive_print(indent, item)
            else:
                print(item)
i = 0
dummy_feed = feeds.feeds[0:5]
for feed in dummy_feed:
    feed["de"]={
        "P":1,
        "E":2,
        "RNB":9
    }
    feed["fi"]={
        "P":3,
        "E":4
    }
    feed["gb"]={
        "P":5,
        "E":6
    }
    feed["fr"]={
        "P":7,
        "E":8
    }

for feed in dummy_feed:
    print(feed["name"])
options = Options(12345, -1, 0.5, "gb", 1)
dummy_cow = Cow(2, "FV_c")
lp = get(dummy_cow, dummy_feed, options)
print(lp["bounds"])
recursive_print(0, lp["bounds"])

