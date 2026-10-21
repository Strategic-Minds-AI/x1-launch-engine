'use strict';
const dialog=document.querySelector('#review-dialog');
document.querySelectorAll('[data-open-review]').forEach(button=>button.addEventListener('click',()=>dialog?.showModal()));
dialog?.addEventListener('close',()=>{dialog.querySelector('#journey')?.reset();const status=dialog.querySelector('#journey-status');if(status)status.textContent='';});
document.querySelector('#journey')?.addEventListener('submit',event=>{
  event.preventDefault();
  const form=event.currentTarget;
  if(!form.reportValidity())return;
  const status=document.querySelector('#journey-status');
  status.textContent='Your next step: prepare a short timeline and questions about fees, communication and timing. Confirm a secure channel with the lawyer you choose. No consultation request was sent.';
});
