'''
Drilled shaft design 
Author: Ryan Carpus
Purpose: analyze the performance of a drilled shaft foundation in a stratified soil profile in compression and in tension
Instructions: User should not interact with directly with this file. 
  All user input is kept in the "user_input.py" in the same directory.
Improvements to make: Add support for different foundation shapes and materials - DONE
  account for use of drilling mud, p 7.2-198
  exclude top 5 and bottom 5 feet, and exclude side resistance if bearing on relatively hard soil p 7.2-199
CAUTION: If the pile is bearing on soil that is significantly stiffer than the side friction soil, consider neglecting side friction.
         To do this, you must edit the stratum in the input file. (7.2-199)

'''

import math
from user_input import *

def pounds_to_kips(load):
  return load / 1000

def diameter_to_area(diameter):
  return math.pi * (diameter / 2) ** 2

def weight_of_foundation(diameter, embedment_depth):
  if embedment_depth < depth_to_water_table:
    return math.pi * (diameter / 2) ** 2 * embedment_depth  * 150
  else:
    return math.pi * (diameter / 2) ** 2 * (depth_to_water_table  * 150 + (embedment_depth - depth_to_water_table) * (150-62.4))

def phi_to_Nq(phi):
  if Nq_toggle == True: #For drilled piers
    phi_to_Nq_conversion = {
      26: 5,
      27: 6.5, #not in NAVDAC
      28: 8,
      29: 9, #not in NAVDAC
      30: 10,
      31: 12,
      32: 14,
      33: 17,
      34: 21,
      35: 25,
      36: 30,
      37: 38,
      38: 43,
      39: 60,
      40: 72
    }
    return phi_to_Nq_conversion[phi]
  else: #for driven piles
    phi_to_Nq_conversion = {
      26: 10,
      27: 12.5, #not in NAVDAC
      28: 15,
      29: 18, #not in NAVDAC
      30: 21,
      31: 24,
      32: 29,
      33: 35,
      34: 42,
      35: 50,
      36: 62,
      37: 77,
      38: 86,
      39: 120,
      40: 145
    }
    return phi_to_Nq_conversion[phi]    

def end_bearing_granular(effective_stress, phi, diameter):
  Nq = phi_to_Nq(phi)
  At = diameter_to_area(diameter)
  return effective_stress * Nq * At


def cohesion_to_adhesion(c):
  #This assumes concrete or timber pile
  # a = bottom of a range + (c - min in c range) / c range * range of a
  if c < 250:
    a = c
  elif c < 500: #adhesion range 250-480
    a = 250. + (c - 250.) / 250 *  230
  elif c < 1000: #480-750
    a = 480. + (c - 500) / 500 * 270
  elif c < 2000: #750-950
    a = 750 + (c - 1000) / 1000 * 200
  elif c < 4000: #950-1300
    a = 950 + (c - 2000) / 2000 * 350
  else:
    a = 1300
  return a

def bearing_capacity_factor_cohesive(depth, diameter):
  x = depth / diameter
  if x < 4:
    return 6.29 + 1.88*x + -.506*x**2 + .0632*x**3 + -.0031*x**4
  else:
    return 9

def end_bearing_cohesive(cohesion, depth, diameter):
  return cohesion * math.pi * (diameter / 2) ** 2 * bearing_capacity_factor_cohesive(depth, diameter)

def side_friction_cohesive(thickness, cohesion, diameter):
  return math.pi * diameter * thickness * cohesion_to_adhesion(cohesion)

def internal_friction_to_contact_friction(phi): 
  if material == True:
    return 0.75 * phi
  else:
    return 20

def earth_pressure_coefficient(is_compressive):
#for drilled pile less than 24" diameter, but we use it for larger diameter anyway
  if is_compressive == True:
    pile_type_to_K = {
      1 : 0.75,
      2 : 1.25,
      3 : 1.75,
      4 : 0.65,
      5 : 0.7
    }
    return pile_type_to_K[pile_type]
  else:
    pile_type_to_K = {
      1 : 0.4,
      2 : 0.75,
      3 : 1.15,
      4 : 0.45,
      5 : 0.4
    }
    return pile_type_to_K[pile_type]

def side_friction_granular(thickness, phi, effective_stress, is_compressive, diameter):
  return earth_pressure_coefficient(is_compressive) * effective_stress * math.tan(internal_friction_to_contact_friction(phi) * math.pi / 180) * math.pi * diameter * thickness


def create_soil_profile(raw_profile, sublayer_thickness):
#divides the user input into many equal thickness layers
#Every layer must be divided evenly by the sublayer thickness
  soil_profile = [] #initialize soil profile
  for stratum in raw_profile: #for each stratum given by user
    layer_height = stratum[0] #layer thickness is given in first index
    num_sublayers = layer_height / sublayer_thickness 
    for i in range(int(num_sublayers)): #for each layer, create sublayers that add up to full height of layer
      soil_profile.append([sublayer_thickness, stratum[1], stratum[2]]) 
  return soil_profile

def create_total_stress_profile(soil_profile):
  total_stress_profile = []
  total_stress = 0
  depth = 0
  for layer in soil_profile:
    depth += layer[0]
    total_stress += layer[0] * layer[1] #incremental total stress equals layer height * unit weight
    total_stress_profile.append([depth, total_stress])
  return total_stress_profile

def create_pore_pressure_profile(soil_profile, water_depth):
  pore_pressure_profile = []
  pore_pressure = 0
  depth = 0
  for layer in soil_profile:
    depth += layer[0]
    if depth > water_depth:
      pore_pressure += 62.4 * layer[0]
    pore_pressure_profile.append([depth, pore_pressure])
  return pore_pressure_profile

def create_effective_stress_profile(total_stress_profile, pore_pressure_profile, diameter):
  effective_stress_profile = []
  for i in range(len(total_stress_profile)):
    depth = total_stress_profile[i][0]
    if depth <= 20 * diameter:
      effective_stress = total_stress_profile[i][1] - pore_pressure_profile[i][1]
    else: #effective stress stops increasing at 20*D
      effective_stress = effective_stress_profile[i-1][1]
    effective_stress_profile.append([depth, effective_stress])
  return effective_stress_profile

def create_side_friction_profile(soil_profile, effective_stress_profile, is_compressive, diameter, ignored_depth, layer_thickness):
  side_friction_profile = []
#set side friction to given depth equal to zero
  for i in range(int(ignored_depth / layer_thickness)):
    side_friction_profile.append([effective_stress_profile[i][0], 0])
#start counting side friction for either granular or cohesive layer
  for i in range(int(ignored_depth / layer_thickness), len(soil_profile)):
    if soil_profile[i][2] < 100:
      side_friction = side_friction_granular(soil_profile[i][0], soil_profile[i][2], effective_stress_profile[i][1], is_compressive, diameter)
    else:
      side_friction = side_friction_cohesive(soil_profile[i][0], soil_profile[i][2], diameter)
    side_friction_profile.append([effective_stress_profile[i][0], side_friction])
  return side_friction_profile

def calculate_ultimate_side_friction(side_friction_profile, embedment_depth):
  ultimate_side_friction = 0
  for layer in side_friction_profile:
    if layer[0] <= embedment_depth:
      ultimate_side_friction += layer[1]
    else:
      break
  return ultimate_side_friction

def calculate_ultimate_toe_bearing(soil_profile, effective_stress_profile, embedment_depth, layer_thickness, diameter, is_compressive):
  if is_compressive == False:
    return 0 #no toe bearing in tension
  elif soil_profile[int(embedment_depth / layer_thickness)][2] < 100: #if layer BENEATH embedment is granular
    return end_bearing_granular(effective_stress_profile[int(embedment_depth / layer_thickness) - 1][1], soil_profile[int(embedment_depth / layer_thickness)][2], diameter) #calc end bearing based on stress AT embedment
  else:
    return end_bearing_cohesive(soil_profile[int(embedment_depth / layer_thickness)][2], embedment_depth, diameter)

def calculate_allowable_load(ultimate_side_friction, ultimate_toe_bearing, safety_factor, is_compressive, diameter, embedment_depth):
  if is_compressive:
    return (ultimate_side_friction + ultimate_toe_bearing) / safety_factor
  else:
    return (ultimate_side_friction + ultimate_toe_bearing) / safety_factor + weight_of_foundation(diameter, embedment_depth)

def analyze_pile(diameter, embedment_depth, is_compressive, safety_factor):
  total_stress_profile = create_total_stress_profile(divided_soil_profile)
  pore_pressure_profile = create_pore_pressure_profile(divided_soil_profile, depth_to_water_table)
  effective_stress_profile = create_effective_stress_profile(total_stress_profile, pore_pressure_profile, diameter)
  side_friction_profile = create_side_friction_profile(divided_soil_profile, effective_stress_profile, is_compressive, diameter, ignored_depth, layer_thickness)
  ultimate_side_friction = calculate_ultimate_side_friction(side_friction_profile, embedment_depth)
  ultimate_toe_bearing = calculate_ultimate_toe_bearing(divided_soil_profile, effective_stress_profile, embedment_depth, layer_thickness, diameter, is_compressive)
  allowable_load = pounds_to_kips(calculate_allowable_load(ultimate_side_friction, ultimate_toe_bearing, safety_factor, is_compressive, diameter, embedment_depth))
  print("Diameter = %d   Depth = %d     Allowable load = %d " % (diameter, embedment_depth, allowable_load))

def analyze_range(diameter_list, embedment_list, is_compressive, safety_factor):
  if is_compressive:
    print("----\nEvaluating deep foundation in compression\n")
  else:
    print("----\nEvaluating deep foundation in tension\n")
  for diameter in diameter_list:
    for embedment in embedment_list:
      analyze_pile(diameter, embedment, is_compressive, safety_factor)
    print('')

#analysis begins here
divided_soil_profile = create_soil_profile(input_soil_profile, layer_thickness)
analyze_range(diameters_to_check, embedments_to_check, True, safety_factor_compression)
analyze_range(diameters_to_check, embedments_to_check, False, safety_factor_tension)



