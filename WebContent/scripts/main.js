(function(){
	var user_id ='1111';
	var user_fullname = 'John Doe';
	var lng = -122.08;
	var lat = 37.38;
	
	
	function init(){
		// Register event listeners
		 $('login-btn').addEventListener('click', login);
		$('nearby-btn').addEventListener('click', loadNearbyItems);
		$('fav-btn').addEventListener('click', loadFavoriteItems);
		$('recommend-btn').addEventListener('click', loadRecommendedItems);

		validateSession();

		// onSessionValid({
		// user_id : '1111',
		// name : 'John Doe'
		// });
		var welcomeMsg = $('welcome-msg');
		welcomeMsg.innerHTML = 'Welcome, ' + user_fullname;
		initGeoLocation();
	}
	
	function validateSession(){
		// parameter
		//var url = 'http://34.222.78.188/TitanAuth/login';
		var url = './login';
		var req = JSON.stringify({});
		//display lading message
		console.log('Validating session......');
		
		// ajax call
		ajax('GET', url, req,
				// session is still valid
				function(res){
			var result = JSON.parse(res);
			if (result.status === 'OK') {
				onSessionValid(result);
			}
		}, onSessionInvalid);
	}
	function onSessionValid(result) {
		user_id = result.user_id;
		user_fullname = result.name;

		var loginForm = $('login-form');
		var itemNav = $('item-nav');
		var itemList = $('item-list');
		var avatar = $('avatar');
		var welcomeMsg = $('welcome-msg');
		var logoutBtn = $('logout-link');

		welcomeMsg.innerHTML = 'Welcome, ' + user_fullname;

		showElement(itemNav);
		showElement(itemList);
		showElement(avatar);
		showElement(welcomeMsg);
		showElement(logoutBtn, 'inline-block');
		hideElement(loginForm);

		initGeoLocation();
	}
	function onSessionInvalid(){
		console.log('failed...');
		var loginForm = $('login-form');
		var itemNav = $('item-nav');
		var itemList = $('item-list');
		var avatar = $('avatar');
		var welcomeMsg = $('welcome-msg');
		var logoutBtn = $('logout-link');
		
		hideElement(itemNav);
		hideElement(itemList);
		hideElement(avatar);
		hideElement(logoutBtn);
		hideElement(welcomeMsg);

		showElement(loginForm);
	}
	function initGeoLocation(){
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(onPositionUpdated, onLoadPositionFailed, {
				maximumAge:60000});
			showLoadingMessage('Retrieving your location...');
		} else {
			onLoadPositionFailed();
		}	
	}
	function onPositionUpdated(position) {
		lat = position.coords.latitude;
		lng = position.coords.longitude;
		
		loadNearbyItems();
	}
    function onLoadPositionFailed() {
        console.warn('navigator.geolocation is not available');
        getLocationFromIP();
    }
	
    function getLocationFromIP() {
        // Get location from http://ipinfo.io/json
        var url = 'http://ipinfo.io/json'
        var req = null;
        ajax('GET', url, req, function(res) {
            var result = JSON.parse(res);
            if ('loc' in result) {
                var loc = result.loc.split(',');
                lat = loc[0];
                lng = loc[1];
            } else {
                console.warn('Getting location by IP failed.');
            }
            loadNearbyItems();
        });
    }
	
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
	function login(){
		var username = $('username').value;
		var password = $('password').value;
		password = md5(username + md5(password));
		//console.log(username+ " " + password);
		
		// The request parameters
//	   	var url = 'http://34.222.78.188/TitanAuth/login';
		var url = './login';

	   	var req = JSON.stringify({
	       		user_id : username,
	       		password : password,
	   	});
	   	ajax('POST', url, req,
	   			//successful call back
	   			function(res) {
	   				var result = JSON.parse(res);
	   				//sucessfully logged in
	   				if(result.status === 'OK') {
	   					//console.log(result);
	   					onSessionValid(result);

	   				}
	   			}, 
	   			// log in error
	   			function(){
	   				showLoginError();
	   			},
	   			true);
	}
	function showLoginError() {
		$('login-error').innerHTML = 'Invalid username or password';
	}
	
	function clearLoginError() {
		$('login-error').innerHTML = '';
	}

	
    function activateBtn(btnId) {
    	var btns = document.getElementsByClassName('main-nav-btn');
    	// deactivate all navigator buttons
    	
    	for (var i= 0; i < btns.length; i++) {
    		btns[i].className = btns[i].className.replace(/\bactive\b/, '');
    	}
    	
    	var btn = document.getElementById(btnId);
    	btn.className += ' active';	
    }
	function showLoadingMessage(msg){
		var itemList = document.getElementById("item-list");
		itemList.innerHTML='<p class="notice"> <i class="fa fa-spinner fa-spin"></i>' + msg + '</p>';
	}
	
	function showWarningMessage(msg){
		var itemList = document.getElementById('item-list');
		itemList.innerHTML='<p class="notice"><i class="fa fa-exclamation-triangle"></i>' + msg + '</p>';
	}
	
	function showErrorMessage(msg) {
		var itemList = document.getElementById("item-list");
		itemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-circle"></i> '
			+ msg + '</p>';
	}

    function $(tag, options) {
        if (!options) {
            return document.getElementById(tag);
        }

        var element = document.createElement(tag);

        for (var option in options) {
            if (options.hasOwnProperty(option)) {
                element[option] = options[option];
            }
        }

        return element;
    }
	
	function showElement(element, style) {
		   var displayStyle = style ? style : 'block';
		   element.style.display = displayStyle;
	}
	
	function hideElement(element) {
		   element.style.display = 'none';
	}
	
	function ajax(method, url, data, callback, errorHandler) {
		var xhr = new XMLHttpRequest();

		xhr.open(method, url, true);

		xhr.onload = function() {
			if (xhr.status === 200) {
				callback(xhr.responseText);
			} else if (xhr.status === 403) {
				onSessionInvalid();
			} else {
				errorHandler();
			}
		};

		xhr.onerror = function() {
			console.error("The request couldn't be completed.");
			errorHandler();
		};

		if (data === null) {
			xhr.send();
		} else {
			xhr.setRequestHeader("Content-Type",
					"application/json;charset=utf-8");
			xhr.send(data);
		}
	}
    
    function loadNearbyItems(){
    	console.log('loading nearby items');
    	
    	//activate button
    	
    	activateBtn('nearby-btn');
    	
    	// build the request parameters
    	
    	var url = './search';
    	var params = 'user_id=' + user_id + '&lat=' + lat + '&lon=' + lng;
		var req = JSON.stringify({});
		
		console.log(req);
		
		//display loading message
		console.log('Loading nearby items...');
    	
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url + '?' + params, true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
		xhr.send(req);
		
		xhr.onload=function(){
			if(xhr.status === 200) {
				var items = JSON.parse(xhr.responseText);
				if (!items || items.length === 0) {
					showWarningMessage('No nearby item.');
				} else {
					listItems(items);
					console.log(items);
				}

			} else if (xhr.status === 403) {
					console.log('invalid session');
			} else {
					console.log('error');
			}
		};
		xhr.onerror = function(){
			console.error("The request couldn't be completed.");
			showErrorMessage("The request couldn't be completed.");
		};
		
    }

    function loadFavoriteItems() {
        activateBtn('fav-btn');

        // The request parameters
        var url = './history';
        var params = 'user_id=' + user_id;
        var req = JSON.stringify({});

        // display loading message
        showLoadingMessage('Loading favorite items...');

        // make AJAX call
        ajax('GET', url + '?' + params, req, function(res) {
            var items = JSON.parse(res);
            if (!items || items.length === 0) {
                showWarningMessage('No favorite item.');
            } else {
                listItems(items);
            }
        }, function() {
            showErrorMessage('Cannot load favorite items.');
        });
    }
    
    function loadRecommendedItems() {
        activateBtn('recommend-btn');

        // The request parameters
        var url = './recommendation';
        var params = 'user_id=' + user_id + '&lat=' + lat + '&lon=' + lng;

        var req = JSON.stringify({});

        // display loading message
        showLoadingMessage('Loading recommended items...');

        // make AJAX call
        ajax(
            'GET',
            url + '?' + params,
            req,
            // successful callback
            function(res) {
                var items = JSON.parse(res);
                if (!items || items.length === 0) {
                    showWarningMessage('No recommended item. Make sure you have favorites.');
                } else {
                    listItems(items);
                }
            },
            // failed callback
            function() {
                showErrorMessage('Cannot load recommended items.');
            });
    }
    function changeFavoriteItem(item_id) {
        // Check whether this item has been visited or not
        var li = $('item-' + item_id);
        var favIcon = $('fav-icon-' + item_id);
        var favorite = li.dataset.favorite !== 'true';

        // The request parameters
        var url = './history';
        var req = JSON.stringify({
            user_id: user_id,
            favorite: [item_id]
        });
        var method = favorite ? 'POST' : 'DELETE';

        ajax(method, url, req,
            // successful callback
            function(res) {
                var result = JSON.parse(res);
                if (result.result === 'SUCCESS') {
                    li.dataset.favorite = favorite;
                    favIcon.className = favorite ? 'fa fa-heart' : 'fa fa-heart-o';
                }
            });
    }
    
	function listItems (items){
		var itemList = document.getElementById('item-list');
		itemList.innerHTML = '';

		for (var i = 0; i < items.length; i++) {
			addItem(itemList, items[i]);
		}
	}
	function addItem(itemList, item) {
		var item_id = item.item_id;
		
		// create the <li> tag and specify the id and class attributes
		var li = document.createElement('li');
		li.setAttribute('id', 'item-' + item_id);
		li.setAttribute('class', 'item');
		
		// set the data attribute
		li.dataset.item_id = item_id;
		li.dataset.favorite = item.favorite;
		
		// item image
		var image = document.createElement('img');
		image.setAttribute('src', item.image_url);
		if (item.image_url) {
			image.setAttribute('src', item.image_url);
		} else {
			image.setAttribute('src', 'https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png');
		}
		li.appendChild(image);
		
		// section
		var section = document.createElement('div');
		
		// title
		var title = document.createElement('a');
		title.setAttribute('href', item.url);
		title.setAttribute('target', '_blank');
		title.setAttribute('class', 'item-name');
		title.innerHTML = item.name;
		section.appendChild(title);
		
		// category
		var category = document.createElement('p');
		category.setAttribute('class', item-category);
		category.innerHTML = 'Category: ' + item.categories.join(', ');
		section.appendChild(category);
		
		li.appendChild(section);
		
		// address
		var address = document.createElement('p');
		category.setAttribute('class', item-address);
		address.innerHTML = item.address.replace(/,/g, '<br/>').replace(/\"/g,
				'');
		li.appendChild(address);

		// favorite link
		 var favLink = $('p', {
	            className: 'fav-link'
	        });

	        favLink.onclick = function() {
	            changeFavoriteItem(item_id);
	        };

	        favLink.appendChild($('i', {
	            id: 'fav-icon-' + item_id,
	            className: item.favorite ? 'fa fa-heart' : 'fa fa-heart-o'
	        }));


		li.appendChild(favLink);

		itemList.appendChild(li);
	}

	



	
	


	




	init();
	
})();







































