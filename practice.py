

import pulp as lp

# The Simplified Whiskas Model Python Formulation for the PuLP Modeller
# Authors: Antony Phillips, Dr Stuart Mitchell  2007
def simplified_whiskas():
    # Create the 'prob' variable to contain the problem data
    prob = lp.LpProblem("The Whiskas Problem",lp.LpMinimize)

    # The 2 variables Beef and Chicken are created with a lower limit of zero
    x1=lp.LpVariable("ChickenPercent",0,None,lp.LpInteger)
    x2=lp.LpVariable("BeefPercent",0)

    # The objective function is added to 'prob' first
    prob += 0.013*x1 + 0.008*x2, "Total Cost of Ingredients per can"

    # The five constraints are entered
    prob += x1 + x2 == 100, "PercentagesSum"
    prob += 0.100*x1 + 0.200*x2 >= 8.0, "ProteinRequirement"
    prob += 0.080*x1 + 0.100*x2 >= 6.0, "FatRequirement"
    prob += 0.001*x1 + 0.005*x2 <= 2.0, "FibreRequirement"
    prob += 0.002*x1 + 0.005*x2 <= 0.4, "SaltRequirement"

    # The problem data is written to an .lp file
    prob.writeLP("WhiskasModel.lp")

    # The problem is solved using PuLP's choice of Solver
    prob.solve()

    # The status of the solution is printed to the screen
    print("Status:", lp.LpStatus[prob.status])

    # Each of the variables is printed with it's resolved optimum value
    for v in prob.variables():
        print(v.name, "=", v.varValue)

    # The optimised objective function value is printed to the screen
    print("Total Cost of Ingredients per can = ", lp.value(prob.objective))

def full_whiskas():
    # Creates a list of the Ingredients
    Ingredients = ['CHICKEN', 'BEEF', 'MUTTON', 'RICE', 'WHEAT', 'GEL']

    # A dictionary of the costs of each of the Ingredients is created
    costs = {'CHICKEN': 0.013,
             'BEEF': 0.008,
             'MUTTON': 0.010,
             'RICE': 0.002,
             'WHEAT': 0.005,
             'GEL': 0.001}

    # A dictionary of the protein percent in each of the Ingredients is created
    proteinPercent = {'CHICKEN': 0.100,
                      'BEEF': 0.200,
                      'MUTTON': 0.150,
                      'RICE': 0.000,
                      'WHEAT': 0.040,
                      'GEL': 0.000}

    # A dictionary of the fat percent in each of the Ingredients is created
    fatPercent = {'CHICKEN': 0.080,
                  'BEEF': 0.100,
                  'MUTTON': 0.110,
                  'RICE': 0.010,
                  'WHEAT': 0.010,
                  'GEL': 0.000}

    # A dictionary of the fibre percent in each of the Ingredients is created
    fibrePercent = {'CHICKEN': 0.001,
                    'BEEF': 0.005,
                    'MUTTON': 0.003,
                    'RICE': 0.100,
                    'WHEAT': 0.150,
                    'GEL': 0.000}

    # A dictionary of the salt percent in each of the Ingredients is created
    saltPercent = {'CHICKEN': 0.002,
                   'BEEF': 0.005,
                   'MUTTON': 0.007,
                   'RICE': 0.002,
                   'WHEAT': 0.008,
                   'GEL': 0.000}
    # Create the 'prob' variable to contain the problem data
    prob = lp.LpProblem("The Whiskas Problem", lp.LpMinimize)

    # A dictionary called 'ingredient_vars' is created to contain the referenced Variables
    ingredient_vars = lp.LpVariable.dicts("Ingr",Ingredients,0)

    # The objective function is added to 'prob' first
    prob += lp.lpSum([costs[i] * ingredient_vars[i] for i in Ingredients]), "Total Cost of Ingredients per can"

    # The five constraints are added to 'prob'
    prob += lp.lpSum([ingredient_vars[i] for i in Ingredients]) == 100, "PercentagesSum"
    prob += lp.lpSum([proteinPercent[i] * ingredient_vars[i] for i in Ingredients]) >= 8.0, "ProteinRequirement"
    prob += lp.lpSum([fatPercent[i] * ingredient_vars[i] for i in Ingredients]) >= 6.0, "FatRequirement"
    prob += lp.lpSum([fibrePercent[i] * ingredient_vars[i] for i in Ingredients]) <= 2.0, "FibreRequirement"
    prob += lp.lpSum([saltPercent[i] * ingredient_vars[i] for i in Ingredients]) <= 0.4, "SaltRequirement"

    # The problem is solved using PuLP's choice of Solver
    prob.solve()

    # The status of the solution is printed to the screen
    print("Status:", lp.LpStatus[prob.status])

    # Each of the variables is printed with it's resolved optimum value
    for v in prob.variables():
        print(v.name, "=", v.varValue)

    # The optimised objective function value is printed to the screen
    print("Total Cost of Ingredients per can = ", lp.value(prob.objective))

simplified_whiskas()
full_whiskas()