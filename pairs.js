from GeneticAlgorithmProblem import *
import random
import math
import time
import csv

class TravelingSalesmanProblem(GeneticAlgorithmProblem):
    
    genes = []
    dicLocations = {}
    gui = ''
    best = ''
    time = 0
    
    def __init__(self, data_mode,csvfile,numCities, height, width, time):
        self.time = time
        if data_mode == 'Random':
            for itr in range(numCities):
                x = random.uniform(0, width)
                y = random.uniform(0, height)
                coordinate = [x, y]
                self.dicLocations[itr] = coordinate
        elif data_mode == 'Load':
            with open(csvfile, 'r') as my_csv:
                contents = list(csv.reader(my_csv, delimiter=","))
                for itr in range(len(contents)):
                    x , y= contents[itr][0],contents[itr][1]
                    self.dicLocations[itr] = [float(x),float(y)]
    def registerGUI(self, gui):
        self.gui = gui

    def performEvolution(self, numIterations, numOffsprings, numPopulation, mutationFactor):
        if self.gui != '':
            self.gui.start()
        numPopulation = numPopulation * 2
        startTime = time.time()
        population = self.createInitialPopulation(numPopulation, len(self.dicLocations.keys()))
        while True:
            currentTime = time.time()
            if (currentTime - startTime) >= self.time:
                break
            offsprings = {}
            for itr in range(numOffsprings):
                p1, p2 = self.selectParents(population)
                offsprings[itr] = self.crossoverParents2(p1, p2)
                factor = int(mutationFactor * len(self.dicLocations.keys()))
                self.mutation(offsprings[itr], factor)
            population = self.substitutePopulation(population, offsprings)
            mostFittest = self.findBestSolution(population)
            self.best = mostFittest
            print(self.calculateTotalDistance(self.best))
            if self.gui != '':
                self.gui.update()

        endTime = time.time()
        return self.best.getGenotype(), self.fitness(self.best), self.calculateTotalDistance(self.best), (endTime - startTime)

    def fitness(self, instance):
        genotype = instance
        if(type(instance) != list):
            genotype = instance.getGenotype()
        currentCity = 0
        distance = 0.0
        for itr in range(len(genotype)-1):
            nextCity = genotype[currentCity]
            distance = distance + self.calculateDistance(self.dicLocations[currentCity], self.dicLocations[nextCity])
            currentCity = nextCity
        utility = 10000.0 / distance
        return utility
    
    def calculateTotalDistance(self, instance):
        # This genotype is created based upon a position based encoding
    # Fill in the following blanks to complete this method
        genotype = instance.getGenotype()
        currentCity = 0
        distance = 0.0
        for itr in range(len(genotype)-1):
            nextCity = genotype[currentCity]
            current = self.dicLocations[currentCity]
            next = self.dicLocations[nextCity]
            distance = distance + self.calculateDistance(current,next)
            currentCity = nextCity
        return distance
    
    def calculateDistance(self, coordinate1, coordinate2):
        # how to calculate the distance between two cities?
        # how to calculate the square and the square root?
        distance = math.sqrt( math.pow(coordinate1[0]-coordinate2[0], 2) + math.pow(coordinate1[1]-coordinate2[1], 2) )
        return distance

    def getPotentialGenes(self):
        return self.dicLocations.keys()

    def createInitialPopulation(self, numPopulation, numCities):
        population = []
        for itr in range(numPopulation):
            genotype = list(range(numCities))
            while self.isInfeasible(genotype) == False:
                random.shuffle(genotype)
            instance = GeneticAlgorithmInstance()
            instance.setGenotype(genotype)
            population.append( instance )
        return population
        
    def isInfeasible(self, genotype):
        currentCity = 0
        visitedCity = {}
        for itr in range(len(genotype)):
            visitedCity[currentCity] = 1
            currentCity = genotype[currentCity]
            
        if len(visitedCity.keys()) == len(genotype): 
            return True
        else:
            return False
        
    def findBestSolution(self, population):
        idxMaximum = -1
        max = -99999
        for itr in range(len(population)):
            if max < self.fitness(population[itr]):
                max = self.fitness(population[itr])
                idxMaximum = itr
        return population[idxMaximum]


    def selectParents(self, population):
        rankFitness = {}
        originalFitness = {}
        maxUtility = -999999
        minUtility = 999999
        for itr in range(len(population)):
            originalFitness[itr] = self.fitness( population[itr] )
            if maxUtility < originalFitness[itr]:
                maxUtility = originalFitness[itr]
            if minUtility > originalFitness[itr]:
                minUtility = originalFitness[itr]
        for itr1 in range(len(population)):
            for itr2 in range(itr1+1,len(population)):
                if originalFitness[itr1] < originalFitness[itr2]:
                    originalFitness[itr1], originalFitness[itr2] = originalFitness[itr2], originalFitness[itr1]
                    population[itr1], population[itr2] = population[itr2], population[itr1]
        size = float(len(population))
        total = 0.0
        for itr in range(len(population)):
            rankFitness[itr] = ( maxUtility + (float(itr) - 1.0)* (maxUtility - minUtility)) / ( size - 1 )
            total = total + rankFitness[itr]
        
        idx1 = -1
        idx2 = -1
        while idx1 == idx2:
            dart = random.uniform(0, total)
            sum = 0.0
            for itr in range(len(population)):
                sum = sum + rankFitness[itr]
                if dart <= sum:
                    idx1 = itr
                    break
            dart = random.uniform(0, total)
            sum = 0.0
            for itr in range(len(population)):
                sum = sum + rankFitness[itr]
                if dart <= sum:
                    idx2 = itr
                    break
        return population[idx1], population[idx2]

    def findLCS(self, genotype1, genotype2):
        longest = [[0 for i in range(50)] for j in range(50)]
        n = len(genotype2)
        # longest[0][0] = 1 if genotype1[0] == genotype2[0] else 0
        # tracking[0][0] = -1
        for i in range(n):
            for j in range(n):
                add = 1 if genotype1[i] == genotype2[j] else 0
                if (add == 1):
                    if (i > 0 and j > 0):
                        longest[i][j] = max(longest[i][j], longest[i - 1][j - 1] + 1)
                    else:
                        longest[i][j] = 1
                else:
                    if (i > 0):
                        longest[i][j] = max(longest[i][j], longest[i - 1][j])
                    if (j > 0):
                        longest[i][j] = max(longest[i][j], longest[i][j - 1])


        track = []
        x, y = n - 1, n - 1

        while (longest[x][y] != 0):
            if (genotype1[x] == genotype2[y]):
                track.append(genotype2[y])
                if (x > 0 and longest[x - 1][y] == longest[x][y] - 1):
                    x -= 1
                elif (y > 0 and longest[x][y - 1] == longest[x][y] - 1):
                    y -= 1
                elif (x > 0 and y > 0 and longest[x - 1][y - 1] == longest[x][y] - 1):
                    x, y = x - 1, y - 1
                elif (x == 0 and y == 0):
                    break
            else:
                # print(longest[x-1][y], longest[x][y-1])
                if (longest[x - 1][y] > longest[x][y - 1]):
                    x -= 1
                else:
                    y -= 1
        track.reverse()
        return track

    def makeChain(self, genotype, index):
        currentCity = index
        chain = [currentCity]
        while True:
            currentCity = genotype[currentCity]
            if(currentCity == index):
                break
            chain.append(currentCity)
        assert(len(chain) == len(genotype))
        return chain

    def makeGenotype(self, chain):
        genotype = {}
        for i in range(len(chain)):
            prev = (i - 1 + len(chain)) % len(chain)
            genotype[chain[prev]] = chain[i]
        return genotype

    def crossoverParents2(self, instance1, instance2):
        genotype1 = instance1.getGenotype()
        genotype2 = instance2.getGenotype()
        newInstance = GeneticAlgorithmInstance()
        newOffspring = []

        index = random.randint(0,len(genotype1)-1)
        chain1, chain2 = self.makeChain(genotype1,index), self.makeChain(genotype2,index)
        lstLCS = self.findLCS(chain1, chain2)
        lstNotInLCS = []
        for j in chain2:
            if ((j in lstLCS) == False):
                lstNotInLCS.append(j)
        random.shuffle(lstNotInLCS)
        OffSpring = []
        id = 0
        for j in chain2:
            if((j in lstLCS) == True):
                OffSpring.append(j)
            else:
                OffSpring.append(lstNotInLCS[id])
                id += 1
        OffSpring = self.makeGenotype(OffSpring)
        newInstance.setGenotype(OffSpring)
        return newInstance




    def crossoverParents(self, instance1, instance2):
        genotype1 = instance1.getGenotype()
        genotype2 = instance2.getGenotype()
        self.crossoverParents2(instance1, instance2)
        newInstance = GeneticAlgorithmInstance()
        
        dicNeighbor = {}
        for itr in range(len(genotype1)):
            neighbor = {}
            neighbor1 = self.getNeighborCity(instance1, itr)
            neighbor2 = self.getNeighborCity(instance2, itr)
            neighbor[neighbor1[0]] = 1
            neighbor[neighbor1[1]] = 1
            neighbor[neighbor2[0]] = 1
            neighbor[neighbor2[1]] = 1
            dicNeighbor[itr] = neighbor.keys()
        
        currentCity = 0
        visitedCity = {}
        path = {}
        # print(dicNeighbor)
        for itr in range(len(genotype1)):
            visitedCity[currentCity] = 1
            nextCity = self.getMinimumNeighborNotVisitedCity(list(visitedCity.keys()), dicNeighbor)
            if nextCity == -1:
                nextCity = 0
            path[currentCity] = nextCity
            currentCity = nextCity
            
        newInstance.setGenotype(path)
        # print(len(path))
        return newInstance       
    
    def getMinimumNeighborNotVisitedCity(self, lstVisitedCity, dicNeighbor):
        cities = list(dicNeighbor.keys())
        for itr in range(len(lstVisitedCity)):
            cities.remove(lstVisitedCity[itr])
        minimum = 999
        candidates = []
        for itr in range(len(cities)):
            location = cities[itr]
            if len(dicNeighbor[location]) <= minimum:
                minimum = len(dicNeighbor[location])
                candidates.append(location)
        random.shuffle(candidates)
        if len(candidates) == 0:
            return -1
        return candidates[0]
        
    def getNeighborCity(self, instance, currentCity):
        
        genotype = instance.getGenotype()
        ret1 = -1
        ret2 = -1
        for itr in range(len(genotype)):
            if genotype[itr] == currentCity:
                ret1 = itr
                break
        ret2 = genotype[currentCity]
        neighbor = [ret1, ret2]
        return neighbor
    
    def mutation(self, instance, factor):
        genotype = instance.getGenotype()
        mutationDone = False
        while mutationDone == True:
            for itr in range(factor):
                idxSwap1 = random.randint(0, len(genotype))
                idxSwap2 = random.randint(0, len(genotype))
                genotype[idxSwap1], genotype[idxSwap2] = genotype[idxSwap2], genotype[idxSwap1]
            if self.isInfeasible(genotype) == True:
                mutationDone = False
            else:
                mutationDone = True
        instance.setGenotype(genotype)
         
    def substitutePopulation(self, population, children):
        for itr1 in range(len(population)):
            for itr2 in range(itr1+1,len(population)):
                if self.fitness(population[itr1]) < self.fitness(population[itr2]):
                    population[itr1], population[itr2] = population[itr2], population[itr1]
        for itr in range(len(children)):
            population[len(population)-len(children)+itr] = children[itr]
        return population
