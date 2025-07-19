// GlOBAL
const MAX_CHARS = 150;
const BASE_API_URL='https://bytegrad.com/course-assets/js/1/api'
const textareaEl = document.querySelector('.form__textarea');
const formEl = document.querySelector('.form');
const counterEl = document.querySelector('.counter');
const feedbackListEL = document.querySelector('.feedbacks');
const submitBtnEl = document.querySelector('.submit-btn');
const spinnerEl = document.querySelector('.spinner');
const hashtahListEL  = document.querySelector('.hashtags');


textareaEl.addEventListener('input', inputHandler) 

function renderFeedbackItem(feedbackItem){
// the new html item
const feedbackItemHTML =`
<li class="feedback">
<button class="upvote">
    <i class="fa-solid fa-caret-up upvote__icon"></i>
    <span class="upvote__count">${feedbackItem.upvoteCount}</span>
</button>
<section class="feedback__badge">
    <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
</section>
<div class="feedback__content">
    <p class="feedback__company">${feedbackItem.company}</p>
    <p class="feedback__text">${feedbackItem.text}</p>
</div>
<p class="feedback__date">${feedbackItem.daysAgo===0 ? 'NEW' : `${feedbackItem.daysAgo}d`}</p>
</li>
    `;
//adding it
feedbackListEL.insertAdjacentHTML('beforeend',feedbackItemHTML)

}
function inputHandler(){
const maxchars =MAX_CHARS;
const typedchars = textareaEl.value.length
const leftchar = maxchars - typedchars
counterEl.textContent = leftchar
}

function showValidIndicator(input){
    const className = input==='valid'? 'form--valid': 'form--invalid';
        formEl.classList.add(className)
        setTimeout( ()=>{
          formEl.classList.remove(className)
   
        }, 2000)
    
    }

formEl.addEventListener('submit' , submitHandler)
function submitHandler(event){
    // first I have to stop default form action
    //which is refresh the page (execue the action address of form)
    event.preventDefault()
    const text = textareaEl.value;
    //validate text before adding
    if (text.includes('#') && text.length >4)
    {
      showValidIndicator('valid')
    }
    else {
        showValidIndicator('invalid')
        textareaEl.focus();
        return;
    }

    //extract info from text
    const hashtag=text.split(' ').find(word => word.includes('#'));
    const company = hashtag.substring(1);
    const badgeLetter = hashtag[1].toUpperCase();
    const daysAgo =0
    const upperVote=0
    //create feedbackItem Object
    const feedbackItem ={
        upvoteCount: upperVote,
        company : company,
        badgeLetter:badgeLetter,
        daysAgo:daysAgo,
        text :text
    }
 // render the new html item
 renderFeedbackItem(feedbackItem)

//send it to the server
fetch(`${BASE_API_URL}/feedbacks`,{
    method:'POST',
    body:JSON.stringify(feedbackItem), //convert to json
    headers: {
        'Content-Type':'application/json',
    }

}).then(response=>{
    if (!response.ok)
    {console.log("something went wrong")
    return;
    }
    else{
    console.log("successfully submitted")
    }
 }).catch(error => console.log(error)
 );
 
 //reseting
 textareaEl.value= ' '
 submitBtnEl.blur();
 counterEl.textContent=MAX_CHARS
}  //END OF SUBMIT HANDLER


//getting feedback list from server request (GET)
fetch(`${BASE_API_URL}/feedbacks`)
.then(response =>{
    return response.json();
}).then(data=>{
    //removing the spinner (loading indicator) before loading the list
    spinnerEl.remove();
    data.feedbacks.forEach(feedbackItem=> {
        renderFeedbackItem(feedbackItem)
    });
})
.catch(error => {
feedbackListEL.textContent(`Failed to fetch feedback items. error Message:
                           ${error.message}`);
})

//arrow func
const clickHandler= (event)=>{
//get the clicked html element
 const clickedEl=event.target;

 //determine if user intend upvote or expanding
 const upvoteIntention= clickedEl.className.includes('upvote');
 if(upvoteIntention){
  const upvoteBtn = clickedEl.closest('.upvote');
  upvoteBtn.disabled = true;
  const upvoteCountEl= upvoteBtn.querySelector('.upvote__count');
  let count = +upvoteCountEl.textContent;
  upvoteCountEl.textContent= ++count;
 }
 else{ //expanding the feedback
 
 // toggle add the class when clicked and the second click it removes the class
    clickedEl.closest('.feedback').classList.toggle('feedback--expand')
 }
};
feedbackListEL.addEventListener('click',clickHandler);

//hashtag list component
clickHandler2 = (event)=>{
 const clickedEl=event.target;

 //stop the function if the click happens outside the hashtags (ul)
 if(clickedEl.className ==="hashtags")
 return;
 
 const companyNameFromHashtag=clickedEl.textContent.substring(1).toLowerCase().trim();
 console.log(companyNameFromHashtag)
 feedbackListEL.childNodes.forEach(childNode =>{
    //stop the iteration if the childnode is text (not object)
 if(childNode.nodeType ===3) return;
 const companyNameFromFeedbackItem =childNode.querySelector('.feedback__company').textContent.toLowerCase().trim();
 if(companyNameFromFeedbackItem!=companyNameFromHashtag)
  childNode.remove();
 });
};

hashtahListEL.addEventListener('click',clickHandler2);