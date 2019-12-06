import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Button, Message, Modal } from 'semantic-ui-react';
import ThemeHeader from './../components/ThemeHeader';
import ThemeBody from './../components/ThemeBody';
import ThemeCard from './../components/ThemeCard';
import API from './../utils/Api';

function Search () {
  // set states for products and search term.
  const [products, setProducts] = useState(['']);
  const [ApiKey] = useState('300131a1a6649b667c037cf4136c26bc');
  const [search, setSearch] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [charity, setCharity] = useState(false);
  const [charityName, setCharityName] = useState(false);
  const [open, setOpen] = useState(false);
  const [userSelect, setUserSelect] = useState(false);

  // get current charity name if there is one
  useEffect(() => {
    API
      .get()
      .then(res => {
        setCharity(res.data.user.charities);
        return res.data.user.charities[0];
      })
      .then(res => {
        axios
          .get(`https://api.data.charitynavigator.org/v2/Organizations/${res}?app_id=ba24e24a&app_key=${ApiKey}`)
          .then(res => {
            setCharityName(res.data.charityName);
          })
          .catch(() => setCharityName(false));
      });
  }, []);

  // capture search from user input update states above
  function handleChange (event) {
    const search = event.target.value.trim() || 'Humane Society';
    setSearch(search);
  }

  // Run API call based on search term
  function charitySearch () {
    axios.get('https://api.data.charitynavigator.org/v2/Organizations?app_id=ba24e24a&app_key=' + ApiKey + '&pageSize=20&search=' + search + '&searchType=name_only&rated=true&sort=Rating')
      .then(res => {
        console.log(res.data);
        setProducts(res.data);
        setIsLoaded(true);
        return products;
      });
  }

  function handleSave (id, charity) {
    setUserSelect({ id, charity });
    if (charity) {
      setOpen(true);
    } else {
      save(id);
    }
  }

  function save (id) {
    const obj = { charities: [id] };
    API
      .post(obj)
      .then(() => console.log('success'));
  }
  // Rerun API call each time search term is changed
  useEffect(() => {
    charitySearch();
  }, [search]);

  return (
    <div>
      <ThemeHeader text='Search for Organizations' />
      <ThemeBody>
        {/* input section to update search term */}
        <Input icon='search' placeholder='Search...' onChange={handleChange} fluid />

        {charityName &&
          <Message info
            icon='info'
            header='You already have a charity selected.'
            content={`You may only select one charity at a time. If you select a new charity, ${charityName} will no longer recieve a portion of your contribution.`}
          />
        }

        {charityName &&
          <Modal size='Tiny' open={open} onClose={() => setOpen(false)}>
            <Modal.Header>Set New Charity</Modal.Header>
            <Modal.Content>
              <p>Please confirm: Your charity selection will be set to {userSelect.charity}. {charityName} will no longer receive a portion of your contribution.</p>
            </Modal.Content>
            <Modal.Actions>
              <Button negative>No</Button>
              <Button
                positive
                icon='checkmark'
                labelPosition='right'
                content='Confirm'
                onClick={() => {
                  save(userSelect.id);
                  setOpen(false);
                  setCharity(userSelect.id);
                  setCharityName(userSelect.charity);
                }}
              />
            </Modal.Actions>
          </Modal>
        }

        {/* Map through all of products in the state and display them onto the page */}
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
                  <Button fluid basic color='blue' onClick={() => handleSave(charity.ein, charity.charityName)}>Select</Button>
                </ThemeCard>
              </div>
            ))
          }
        </div>

      </ThemeBody>
    </div>
  );
}

export default Search;
