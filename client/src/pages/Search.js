import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Button, Message, Modal, Header } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import ThemeContainer from './../components/ThemeContainer';
import ThemeBody from './../components/ThemeBody';
import ThemeCard from './../components/ThemeCard';
import ThemeSliderUseState from './../components/ThemeSliderUseState';
import API from './../utils/Api';

function Search () {
  const [products, setProducts] = useState(['']);
  const ApiKey = process.env.REACT_APP_CHARITY_API_KEY;
  const [search, setSearch] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [ein, setEIN] = useState(false);
  const [charityName, setCharityName] = useState(false);
  const [charityLink, setCharityLink] = useState(false);
  const [charityTagLine, setCharityTagLine] = useState(false);
  const [charityCity, setCharityCity] = useState(false);
  const [charityState, setCharityState] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [modal2, setModal2] = useState(false);
  const [userSelect, setUserSelect] = useState(false);
  const [charityProportion, setCharityProportion] = useState([1]);
  const [redirect, setRedirect] = useState(false);

  // get current charity name if there is one
  useEffect(() => {
    API
      .get()
      .then(res => {
        if (res.data.user.userSelectedInfo.portion !== 0) {
          setCharityName(res.data.user.userSelectedInfo.charityName);
          setCharityProportion([res.data.user.userSelectedInfo.portion]);
        }
      });
  }, []);

  // Rerun API call each time search term is changed
  useEffect(() => {
    axios.get('https://api.data.charitynavigator.org/v2/Organizations?app_id=ba24e24a&app_key=' + ApiKey + '&pageSize=20&search=' + search + '&searchType=name_only&rated=true&sort=Rating')
      .then(res => {
        setProducts(res.data);
        setIsLoaded(true);
      });
  }, [search, ApiKey]);

  // capture search from user input update states above
  function handleChange (event) {
    const search = event.target.value.trim() || 'Humane Society';
    setSearch(search);
  }

  function handleSave (ein, charityName, charityLink, charityTagLine, charityCity, charityState) {
    setUserSelect({ ein, charityName, charityLink, charityTagLine, charityCity, charityState });
    setModal1(true);
  }

  function save (ein, portion, charityName, charityLink, charityTagLine, charityCity, charityState) {
    const obj = { ein, portion, charityName, charityLink, charityTagLine, charityCity, charityState };
    API
      .post({
        userSelectedInfo: obj
      })
      .then(() => setRedirect(true));
  }

  return (
    <ThemeContainer text='Search for Organizations'>
      { redirect && <Redirect to='/review' />}
      <ThemeBody>

        {/* input section to update search term */}
        <Input icon='search' placeholder='Search...' onChange={handleChange} fluid />

        {/* Message warning users if they have already selected a charity */}
        {charityName &&
          <Message info
            icon='info'
            header='You already have a charity selected.'
            content={`You may only select one charity at a time. If you select a new charity, ${charityName} will no longer recieve a portion of your contribution.`}
          />
        }

        {/* Modal confirming charity choice */}
        {isLoaded &&
          <Modal size='tiny' open={modal1} onClose={() => setModal1(false)}>
            <Modal.Header>Please Confirm</Modal.Header>
            <Modal.Content>
              {charityName && userSelect.charityName &&
                <p>Your charity selection will be set to {userSelect.charityName}. {charityName} will no longer receive a portion of your contribution.</p>
              }
              {!charityName && userSelect.charityName &&
                <p>Your charity selection will be set to {userSelect.charityName}.</p>
              }
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={() => {
                setModal1(false);
              }} negative>Cancel</Button>
              <Button
                positive
                icon='checkmark'
                labelPosition='right'
                content='Confirm'
                onClick={() => {
                  setModal1(false);
                  setModal2(true);
                  setEIN(userSelect.ein);
                  setCharityName(userSelect.charityName);
                  setCharityLink(userSelect.charityLink);
                  setCharityTagLine(userSelect.charityTagLine);
                  setCharityCity(userSelect.charityCity);
                  setCharityState(userSelect.charityState);
                }}
              />
            </Modal.Actions>
          </Modal>
        }

        {/* Modal collecting proportion information */}
        {isLoaded &&
          <Modal size='tiny' open={modal2} onClose={() => setModal2(false)}>
            <Modal.Header>Assign Contribution</Modal.Header>
            <Modal.Content>
              <Header as='h4'>
                Please select the portion of your contribution that will go to this charity:
              </Header>

              <ThemeSliderUseState stateKey='charityProportion' value={charityProportion} stateHandler={setCharityProportion} leftLabel='0%' rightLabel='100%' />
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={() => {
                setModal2(false);
              }} negative>Cancel</Button>
              <Button
                positive
                icon='checkmark'
                labelPosition='right'
                content='Submit'
                onClick={() => {
                  save(ein, charityProportion[0], charityName, charityLink, charityTagLine, charityCity, charityState);
                  setModal2(false);
                }}
              />
            </Modal.Actions>
          </Modal>
        }

        {/* Map through all of charities in the state and display them onto the page */}
        <div>
          {isLoaded &&
            products.map(charity => (
              <div key={charity.ein}>
                <ThemeCard
                  title={charity.charityName}
                  image={charity.cause.image}
                  link={charity.websiteURL}
                  tagLine={charity.tagLine}
                  EIN={charity.ein}
                  cause={charity.cause.causeName}
                  city={charity.mailingAddress.city}
                  state={charity.mailingAddress.stateOrProvince}
                >
                  <Button fluid basic color='blue' onClick={() => handleSave(charity.ein, charity.charityName, charity.websiteURL, charity.tagLine, charity.mailingAddress.city, charity.mailingAddress.stateOrProvince)}>Select</Button>
                </ThemeCard>
              </div>
            ))
          }
        </div>
      </ThemeBody>
    </ThemeContainer>
  );
}

export default Search;
