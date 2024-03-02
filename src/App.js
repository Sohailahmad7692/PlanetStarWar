// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import styled from 'styled-components';
const PlanetContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  justify-content: space-around;
  :hover{
    transform: scale(1.01);
    transition: transform 0.3s ease-in-out;
  }
  @media only screen(max-width:768px){
    grid-template-columns: 1fr;
  }
  `;

const PlanetCard = styled.div`
  border: 1px solid #555;
  border-radius: 8px;
  padding: 16px;
  background-color: #444; /* Dark background color */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
  @media only screen(max-width:768px){
    width: 100%;
  }
  `
const Pagination = styled.div`
    margin-top: 20px;
  `;
const Button = styled.button`
  font-size: 16px;
  margin: 5px;
  padding: 8px 16px;
  cursor: pointer;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s ease-in-out;
  :hover{
      background-color: #0056b3;
    }
  :disabled{
      background-color: #555;
      cursor: not-allowed;
    }
  `;
const UnorderList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  `;

const List = styled.li`
  color: #aaa;
  margin-bottom: 5px;
`;
const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  `;
const Spinner = styled.div`
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 4px solid #ffc107; /* Star Wars yellow */
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    `;

const App = () => {
  const [planets, setPlanets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://swapi.dev/api/planets/?page=${currentPage}&format=json`);
        const planetsData = await Promise.all(
          response.data.results.map(async (planet) => {
            const residentsData = await Promise.all(
              planet.residents.map(async (residentUrl) => {
                const resident = await axios.get(residentUrl);
                return resident.data;
              })
            );
            return { ...planet, residents: residentsData };
          })
        );
        setPlanets(planetsData);
        setNextPage(response.data.next);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="App">
      <h1>Planets Directory</h1>
      {loading ? (
        <SpinnerContainer>
          <Spinner></Spinner>
        </SpinnerContainer>
      ) : (
        <div>
          <PlanetContainer>
            {planets.map((planet) => (
              <PlanetCard key={planet.name}>
                <h2>{planet.name}</h2>
                <p>Climate: {planet.climate}</p>
                <p>Population: {planet.population}</p>
                <p>Terrain: {planet.terrain}</p>

                {planet.residents.length > 0 && (
                  <div>
                    <h3>Residents:</h3>
                    <UnorderList>
                      {planet.residents.map((resident) => (
                        <List key={resident.name}>
                          {resident.name} - Height: {resident.height}, Mass: {resident.mass}, Gender: {resident.gender}
                        </List>
                      ))}
                    </UnorderList>
                  </div>
                )}
              </PlanetCard>
            ))}
          </PlanetContainer>

          <Pagination>
            <Button onClick={handlePrevPage} disabled={currentPage === 1}>
              Previous Page
            </Button>
            <Button onClick={handleNextPage} disabled={!nextPage}>
              Next Page
            </Button>
          </Pagination>
        </div>)}
    </div>
  );
};

export default App;
