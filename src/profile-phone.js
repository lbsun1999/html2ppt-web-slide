export function addProfilePhone(root){
 const contact=root.querySelector('.profile-contact');if(!contact||root.querySelector('[data-slide-field="profilePhone"]')||/电话|手机|\bTel\b/i.test(contact.textContent))return;
 const phone=document.createElement('p');phone.className='profile-phone';phone.dataset.text='';phone.dataset.slideField='profilePhone';phone.textContent='电话：联系电话';contact.after(phone);
}
