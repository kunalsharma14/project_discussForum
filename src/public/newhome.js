/*!
 * Offcanvas Sidebar v0.1
 * Copyright 2017 - present Morten Sørensen (https://moso.io)
 * Licensed under the MIT license
 * --------------------------------------------------------------
 * Script that clones the current Bootstrap markup,
 * and inserts it into a sidebar with some smooth animations
 *
 * - Built to work with Bootstrap 4 and supports multiple navbars
 * - Fully customizable with comments
 */

var window_height;
var window_width;
var navbar_initialized = false;
var nav_toggle;

var offCanvas = {
    sidenav: {
        // Sidenav is not visible by default.
        // Change to 1 if necessary
        sidenav_visible: 0
    },
    initSideNav: function initSideNav() {
        if (!navbar_initialized) {
            var $nav = $('nav');

            // Add the offcanvas class to the navbar if it's not initialized
            $nav.addClass('navbar-offcanvas');

            // Clone relevant navbars
            var $navtop = $nav.find('.navbar-top').first().clone(true);
            var $navbar = $nav.find('.navbar-collapse').first().clone(true);

            // Let's start with some empty vars
            var ul_content = '';
            var top_content = '';

            // Set min-height of the new sidebar to the screen height
            $navbar.css('min-height', window.screen.height);

            // Take the content of .navbar-top
            $navtop.each(function() {
                var navtop_content = $(this).html();
                top_content = top_content + navtop_content;
            });

            // Take the content of .navbar-collapse
            $navbar.children('ul').each(function() {
                var nav_content = $(this).html();
                ul_content = ul_content + nav_content;
            });

            // Wrap the new content inside an <ul>
            ul_content = '<ul class="navbar-nav sidebar-nav">' + ul_content + '</ul>';

            // Insert the html content into our cloned content
            $navbar.html(ul_content);
            $navtop.html(top_content);

            // Append the navbar to body,
            // and insert the content of the navicons navbar just below the logo/nav-image
            $('body').append($navbar);
            $('.nav-image').after($navtop);


            // Set the toggle-variable to the Bootstrap navbar-toggler button
            var $toggle = $('.navbar-toggler');

            // Add/remove classes on toggle and set the visiblity of the sidenav,
            // and append the overlay. Also if the user clicks the overlay,
            // the sidebar will close
            $toggle.on('click', function () {
                if (offCanvas.sidenav.sidenav_visible == 1) {
                    $('html').removeClass('nav-open');
                    offCanvas.sidenav.sidenav_visible = 0;
                    $('#overlay').remove();
                    setTimeout(function() {
                        $toggle.removeClass('toggled');
                    }, 300);
                } else {
                    setTimeout(function() {
                        $toggle.addClass('toggled');
                    }, 300);

                    // Add the overlay and make it close the sidenav on click
                    var div = '<div id="overlay"></div>';
                    $(div).appendTo("body").on('click', function() {
                        $('html').removeClass('nav-open');
                        offCanvas.sidenav.sidenav_visible = 0;
                        $('#overlay').remove();
                        setTimeout(function() {
                            $toggle.removeClass('toggled');
                        }, 300);
                    });

                    $('html').addClass('nav-open');
                    offCanvas.sidenav.sidenav_visible = 1;
                }
            });
            // Set navbar to initialized
            navbar_initialized = true;
        }
    }
};

$(document).ready(function () {

	// search bar starts
	const suggestions = document.getElementById('suggestions');
 	$('#searchbar').keydown(async (e) => {
		let value = e.target.value;
		$.ajax({
			url: '/search',
			method: 'POST',
			data: {query: value},
			dataType: 'json'
		})
		.done((data) => {
			if(data == undefined) return;
			if(value.length == 0) {
				suggestions.innerHTML = "";
				return;
			}

			const markup = data.map(item => `\
				<div onclick="window.location.href='/chatroom/card/${item.cid}'" class="suggestion-cards" id="${item.cid}">\
					<h4>${item.keywords}</h4>\
				</div>\
			`)
			.join('');

			suggestions.innerHTML = markup;
		})
		.fail((err) => {
			console.log("failed err = ", err);
		})
	})
	// search bar ends




    window_width = $(window).width();

    nav_toggle = $('nav').hasClass('navbar-offcanvas') ? true : false;

    // Responsive checks
    if (window_width < 992 || nav_toggle) {
        offCanvas.initSideNav();
    }

    // Close the sidebar if the user clicks a link or a dropdown-item,
    // and close the sidebar
    $('.nav-link:not(.dropdown-toggle), .dropdown-item').on('click', function () {
        var $toggle = $('.navbar-toggler');

        $('html').removeClass('nav-open');
        offCanvas.sidenav.sidenav_visible = 0;
        setTimeout(function () {
            $toggle.removeClass('toggled');
        }, 300);
	});
});

$(window).resize(function () {
    window_width = $(window).width();

    // More responsive checks if the user resize the browser
    if (window_width < 992) {
        offCanvas.initSideNav();
    }

    if (window_width > 992 && !nav_toggle) {
        $('nav').removeClass('navbar-offcanvas');
        offCanvas.sidenav.sidenav_visible = 1;
        navbar_initialized = false;
	}

});


$(function()
{
    let createCard=$('#cardBtn')
    let desc=$('#desc')
    let keywords=$('#keywords')
    let recentsection=$('#recentsec')

    $.get(
        '/card',
        function(data)
        {
            recentsection.empty();
            for(let row of data)
            {
                recentsection.append(` <div class="card">
                <div onclick="window.location.href='/chatroom/card/${row.cid}'" class="card-body">
                    <h5 class="card-title">
                        <strong>Keywords:</strong>
                        <hr class="hrline">
                       ${row.keywords}
                    </h5>
                    <p class="card-text">
                        <strong>Description:</strong>
                        <hr class="hrline">
                        ${row.description}
                    </p>
                </div>
        </div>`)
            }
        }
    )

    let notiSection=$('#notiSection');
    $.get(
        '/card/notifications',
        function(data){
            notiSection.empty();
            for(let row of data){
                notiSection.append(` <li onclick="window.location.href='/chatroom/card/${row}'">
                <div class="notify_data">
                  <div class="title"> chat id: ${row}  </div>
                  <div class="sub_title"> has unseen messages </div>
                </div>
              </li>  `);
            }
            notiSection.append(`<li class="show_all">
            <p class="link">Show All Activities</p>
          </li> `);
        }
    )

    createCard.click(function(){
        let keyvalues=keywords.val()
        let description=desc.val()

            $.post(
                '/card/new',
                {keyvalues:keyvalues, description:description},
                function(data)
                {

                    if(data.status=="sucess"){
                    recentsection.append(` <div class="card">
                    <div onclick="window.location.href='/chatroom/card/${data.data.cid}'" class="card-body">
                        <h5 class="card-title">
                            <strong>Keywords:</strong>
                            <hr class="hrline">
                           ${keyvalues}
                        </h5>
                        <p class="card-text">
                            <strong>Description:</strong>
                            <hr class="hrline">
                            ${description}
                        </p>
                    </div>
            </div>`)
                    }
                }
            )
		})

})



// TRENDING
$('#trending').click(e => {
	console.log("trending clicked!")

	$('#recentsec').html("");
	$.get(
		'/card/trending',
		data => {
			if(data === undefined || data === null || data.length === 0 || data === "") {
				data = JSON.parse(localStorage.getItem('trending'));
			}
			else {
				localStorage.setItem('trending', JSON.stringify(data));
			}
			show(data);
	})

})

function show(data) {
	data.forEach(row => {
		$('#recentsec').append(` <div class="card">
			<div onclick="window.location.href='/chatroom/card/${row.cid}'" class="card-body">
				<h5 class="card-title">
					<strong>Keywords:</strong>
					<hr class="hrline">
					${row.keywords}
				</h5>
				<p class="card-text">
					<strong>Description:</strong>
					<hr class="hrline">
					${row.description}
				</p>
			</div>
		</div>`);
	})
}


// RECENTLY CREATED
$('#recently-created').click(e => {
	console.log("recently created clicked!");

	$('#recentsec').html("");
	$.get(
		'/card/recentlycreated',
		data => {
			data.forEach(row => {
				$('#recentsec').append(` <div class="card">
					<div onclick="window.location.href='/chatroom/card/${row.cid}'" class="card-body">
						<h5 class="card-title">
							<strong>Keywords:</strong>
							<hr class="hrline">
							${row.keywords}
						</h5>
						<p class="card-text">
							<strong>Description:</strong>
							<hr class="hrline">
							${row.description}
						</p>
					</div>
				</div>`);
			})
		}
	)
})

// PARTICIPATED
$('#participated').click(e => {
	console.log("participated clicked!");

	$('#recentsec').html("");
	$.get(
		'/users/participated',
		data => {
			data.forEach(row => {
				$('#recentsec').append(` <div class="card">
					<div onclick="window.location.href='/chatroom/card/${row.cid}'" class="card-body">
						<h5 class="card-title">
							<strong>Keywords:</strong>
							<hr class="hrline">
							${row.keywords}
						</h5>
						<p class="card-text">
							<strong>Description:</strong>
							<hr class="hrline">
							${row.description}
						</p>
					</div>
				</div>`);
			})
		}
	)
})
