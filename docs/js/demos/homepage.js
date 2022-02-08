const Shuffle = window.Shuffle;

class Demo {
  constructor(element) {
    this.element = element;

    this.shuffle = new Shuffle(element, {
      itemSelector: '.picture-item',
      sizer: element.querySelector('.my-sizer-element'),
    });

    // Log events.
    this.addShuffleEventListeners();

    this._activeFilters = [];

    this.addFilterButtons();
    this.addSorting();
    this.addSearchFilter();

    this.mode = 'exclusive';
  }

  toggleMode() {
    if (this.mode === 'additive') {
      this.mode = 'exclusive';
    } else {
      this.mode = 'additive';
    }
  }

  /**
   * Shuffle uses the CustomEvent constructor to dispatch events. You can listen
   * for them like you normally would (with jQuery for example).
   */
  addShuffleEventListeners() {
    this.shuffle.on(Shuffle.EventType.LAYOUT, (data) => {
      console.log('layout. data:', data);
    });

    this.shuffle.on(Shuffle.EventType.REMOVED, (data) => {
      console.log('removed. data:', data);
    });
  }

  addFilterButtons() {
    const options = document.querySelector('.filter-options');

    if (!options) {
      return;
    }

    const filterButtons = Array.from(options.children);

    filterButtons.forEach((button) => {
      button.addEventListener('click', this._handleFilterClick.bind(this), false);
    }, this);
  }

  _handleFilterClick(evt) {
    const btn = evt.currentTarget;
    const isActive = btn.classList.contains('active');
    const btnGroup = btn.getAttribute('data-group');

    // You don't need _both_ of these modes. This is only for the demo.
    // For this custom 'additive' mode in the demo, clicking on filter buttons
    // doesn't remove any other filters.
    if (this.mode === 'additive') {
      // If this button is already active, remove it from the list of filters.
      if (isActive) {
        this._activeFilters.splice(this._activeFilters.indexOf(btnGroup));
      } else {
        this._activeFilters.push(btnGroup);
      }

      btn.classList.toggle('active');

      // Filter elements
      this.shuffle.filter(this._activeFilters);

      // 'exclusive' mode lets only one filter button be active at a time.
    } else {
      this._removeActiveClassFromChildren(btn.parentNode);

      let filterGroup;
      if (isActive) {
        btn.classList.remove('active');
        filterGroup = Shuffle.ALL_ITEMS;
      } else {
        btn.classList.add('active');
        filterGroup = btnGroup;
      }

      this.shuffle.filter(filterGroup);
    }
  }

  _removeActiveClassFromChildren(parent) {
    const children = parent.children;
    for (let i = children.length - 1; i >= 0; i--) {
      children[i].classList.remove('active');
    }
  }

  addSorting() {
    const buttonGroup = document.querySelector('.sort-options');

    if (!buttonGroup) {
      return;
    }

    buttonGroup.addEventListener('change', this._handleSortChange.bind(this));
  }

  _handleSortChange(evt) {
    // Add and remove `active` class from buttons.
    const buttons = Array.from(evt.currentTarget.children);
    buttons.forEach((button) => {
      if (button.querySelector('input').value === evt.target.value) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    // Create the sort options to give to Shuffle.
    const value = evt.target.value;
    let options = {};

    function sortByDate(element) {
      return Date.parse(element.getAttribute('data-date-created'));
    }

    function sortByTitle(element) {
      return element.getAttribute('data-title').toLowerCase();
    }

    if (value === 'date-created') {
      options = {
        reverse: true,
        by: sortByDate,
      };
    } else if (value === 'title') {
      options = {
        by: sortByTitle,
      };
    }

    this.shuffle.sort(options);
  }

  // Advanced filtering
  addSearchFilter() {
    const searchInput = document.querySelector('.js-shuffle-search');

    if (!searchInput) {
      return;
    }

    searchInput.addEventListener('input', this._handleSearchKeyup.bind(this));
  }

  /**
   * Filter the shuffle instance by items with a title that matches the search input.
   * @param {Event} evt Event object.
   */
  _handleSearchKeyup(evt) {
    const searchText = evt.target.value.toLowerCase();

    this.shuffle.filter((element, shuffle) => {
      // If there is a current filter applied, ignore elements that don't match it.
      if (shuffle.group !== Shuffle.ALL_ITEMS) {
        // Get the item's groups.
        const groups = JSON.parse(element.getAttribute('data-groups'));
        const isElementInCurrentGroup = groups.indexOf(shuffle.group) !== -1;

        // Only search elements in the current group
        if (!isElementInCurrentGroup) {
          return false;
        }
      }

      const titleElement = element.querySelector('.picture-item__title');
      const titleText = titleElement.textContent.toLowerCase().trim();

      return titleText.indexOf(searchText) !== -1;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.demo = new Demo(document.getElementById('grid'));
});
