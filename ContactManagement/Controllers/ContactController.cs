using ContactManagement.Helper;
using ContactManagement.Models;
using ContactManagement.ViewModel;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;

namespace ContactManagement.Controllers
{
    public class ContactController : BaseController
    {
        #region Declaration
        private string result = string.Empty;
        private string message = string.Empty;
        private List<ContactModel> _contactModelList;
        public enum ValidateMode
        {
            NAME = 1,
            MOBILE = 2,
            EMAIL = 3
        }
        #endregion


        // GET: Contact
        public ActionResult Index()
        {
            return View();
        }


        /// <summary>
        /// Get the Contact 
        /// </summary>
        /// <param name="id">Contact ID</param>
        /// <returns></returns>
        [HttpGet]
        public ActionResult GetContact(int? id)
        {
            try
            {
                return ResponseResult(GetContactDetails(id.HasValue ? id.Value : 0));
            }
            catch (Exception)
            {
                return ResponseResult(null, MessageHelper.ErrorMessage, MessageCode.ERROR);
            }

        }

        /// <summary>
        /// Add/Update Contact
        /// </summary>
        /// <param name="Contact Model"></param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult SaveContact(ContactModel contactModel)
        {
            try
            {
                if (Validate(contactModel, ValidateMode.MOBILE))
                {
                    if (Validate(contactModel, ValidateMode.EMAIL))
                    {
                        /* if ContactId is 0 - New contact - Insert 
                           if ContactId is NOT 0 - Existing contact -Update*/
                        if (contactModel != null)
                        {
                            //Getting the existing contact details 
                            var _contact = addressBookEntities.Contacts.Find(contactModel.ContactId);
                            if (_contact != null)
                            {
                                //Assigning the values to the existing contact object
                                _contact.FirstName = contactModel.FirstName;
                                _contact.LastName = contactModel.LastName;
                                _contact.ModifiedOn = DateTime.Now;
                                addressBookEntities.Entry(_contact).State = EntityState.Modified;

                                //if any existing contact number is removed then the status will be Deleted                        
                                foreach (var item in _contact.ContactMobiles.Where(x => x.StatusId == (int)StatusHelper.Active && !contactModel.contactMobileList.Any(m => m.MobileNumber == x.MobileNumber)).ToList())
                                {
                                    item.StatusId = (int)StatusHelper.Deleted;
                                    item.ModifiedOn = DateTime.Now;
                                    addressBookEntities.Entry(item).State = EntityState.Modified;
                                }
                                //if any existing email is removed then the status will be Deleted                        
                                foreach (var item in _contact.ContactEmails.Where(x => x.StatusId == (int)StatusHelper.Active && !contactModel.contactEmailList.Any(m => m.EmailAddress == x.EmailAddress)).ToList())
                                {
                                    item.StatusId = (int)StatusHelper.Deleted;
                                    item.ModifiedOn = DateTime.Now;
                                    addressBookEntities.Entry(item).State = EntityState.Modified;
                                }
                                //Creating new mobile entries
                                foreach (var item in contactModel.contactMobileList.Where(x => !_contact.ContactMobiles.Any(m => m.StatusId == (int)StatusHelper.Active && m.MobileNumber == x.MobileNumber)).ToList())
                                {
                                    addressBookEntities.ContactMobiles.Add(new ContactMobile
                                    {
                                        ContactId = _contact.ContactId,
                                        MobileNumber = item.MobileNumber.ToString(),
                                        StatusId = (int)StatusHelper.Active,
                                        CreatedOn = DateTime.Now,
                                        ModifiedOn = DateTime.Now
                                    });
                                }

                                //Creating new email entries
                                foreach (var item in contactModel.contactEmailList.Where(x => !_contact.ContactEmails.Any(m => m.StatusId == (int)StatusHelper.Active && m.EmailAddress == x.EmailAddress)).ToList())
                                {
                                    addressBookEntities.ContactEmails.Add(new ContactEmail
                                    {
                                        ContactId = _contact.ContactId,
                                        EmailAddress = item.EmailAddress.ToString(),
                                        StatusId = (int)StatusHelper.Active,
                                        CreatedOn = DateTime.Now,
                                        ModifiedOn = DateTime.Now
                                    });
                                }
                                addressBookEntities.SaveChanges();
                                return ResponseResult(null, MessageHelper.ContactUpdateMessage);
                            }
                            else
                            {
                                // Creating New Contact
                                Contact contact = new Contact();
                                //Assigning the values to the contact object
                                contact.FirstName = contactModel.FirstName;
                                contact.LastName = contactModel.LastName;
                                contact.StatusId = (int)StatusHelper.Active;
                                contact.CreatedOn = contact.ModifiedOn = DateTime.Now;
                                addressBookEntities.Contacts.Add(contact);
                                addressBookEntities.SaveChanges();
                                //Creating new mobile entries
                                foreach (var item in contactModel.contactMobileList.Where(x => x.MobileNumber != string.Empty))
                                {
                                    addressBookEntities.ContactMobiles.Add(new ContactMobile
                                    {
                                        ContactId = contact.ContactId,
                                        MobileNumber = item.MobileNumber.ToString(),
                                        StatusId = (int)StatusHelper.Active,
                                        CreatedOn = DateTime.Now
                                    });
                                }
                                //Creating new email entries
                                foreach (var item in contactModel.contactEmailList.Where(x => x.EmailAddress != string.Empty))
                                {
                                    addressBookEntities.ContactEmails.Add(new ContactEmail
                                    {
                                        ContactId = contact.ContactId,
                                        EmailAddress = item.EmailAddress.ToString(),
                                        StatusId = (int)StatusHelper.Active,
                                        CreatedOn = DateTime.Now
                                    });
                                }
                                addressBookEntities.SaveChanges();
                                return ResponseResult(null, MessageHelper.ContactSaveMessage);
                            }

                        }
                        else
                        {
                            return ResponseResult(null, MessageHelper.ErrorMessage, MessageCode.ERROR);
                        }
                    }
                    else
                    {
                        return ResponseResult(null, MessageHelper.ContactEmailAlreadyExists, MessageCode.ERROR);
                    }
                }
                else
                {
                    return ResponseResult(null, MessageHelper.ContactMobileAlreadyExists, MessageCode.ERROR);
                }

            }
            catch (Exception)
            {
                return ResponseResult(null, MessageHelper.ErrorMessage, MessageCode.ERROR);
            }
        }

        /// <summary>
        /// Delete Contact
        /// </summary>
        /// <param name="id">Contact ID</param>
        /// <returns></returns>
        [HttpDelete]
        public ActionResult DeleteContact(int? id)
        {
            try
            {
                //Getting the existing contact details based in ContactID
                var _contact = addressBookEntities.Contacts.Find(id);
                if (_contact != null)
                {
                    _contact.StatusId = (int)StatusHelper.Deleted;
                    _contact.ModifiedOn = DateTime.Now;
                    addressBookEntities.Entry(_contact).State = EntityState.Modified;
                    //Deleting the mobile entries - status change
                    foreach (var item in _contact.ContactMobiles)
                    {
                        item.StatusId = (int)StatusHelper.Deleted;
                        item.ModifiedOn = DateTime.Now;
                        addressBookEntities.Entry(item).State = EntityState.Modified;
                    }
                    //Deleting the email entries - status change
                    foreach (var item in _contact.ContactEmails)
                    {
                        item.StatusId = (int)StatusHelper.Deleted;
                        item.ModifiedOn = DateTime.Now;
                        addressBookEntities.Entry(item).State = EntityState.Modified;
                    }
                    addressBookEntities.SaveChanges();
                }
                else
                {
                    //
                }

                return ResponseResult(null, MessageHelper.ContactDeleteMessage + $"({_contact.FirstName} {_contact.LastName})", MessageCode.OK);
            }
            catch (Exception)
            {
                return ResponseResult(null, MessageHelper.ErrorMessage, MessageCode.ERROR);
            }
        }

        /// <summary>
        /// Validate FirstName and LastName Already Exists or Not
        /// </summary>
        /// <param name="contactModel"></param>
        /// <returns></returns>
        [NonAction]
        public bool Validate(ContactModel contactModel, ValidateMode validateMode)
        {

            try
            {
                //message based on the where condition
                switch (validateMode)
                {
                    case ValidateMode.MOBILE:
                        var isMobileAvailable = addressBookEntities.ContactMobiles.ToList().Where(x => x.StatusId == (int)StatusHelper.Active && x.ContactId != contactModel.ContactId && contactModel.contactMobileList.Any(m => m.MobileNumber == x.MobileNumber)).ToList();

                        if (isMobileAvailable != null && isMobileAvailable.Count > 0)
                            return false;
                        else
                            return true;
                    case ValidateMode.EMAIL:
                        var isEmailAvailable = addressBookEntities.ContactEmails.ToList().Where(x => x.StatusId == (int)StatusHelper.Active && x.ContactId != contactModel.ContactId && contactModel.contactEmailList.Any(m => m.EmailAddress == x.EmailAddress)).ToList();

                        if (isEmailAvailable != null && isEmailAvailable.Count > 0)
                            return false;
                        else
                            return true;
                    default:
                        return true;
                }

            }
            catch (Exception e)
            {

                return false;
            }

        }

        /// <summary>
        /// Get Contact Details based on contactId
        /// </summary>
        /// <param name="contactId">0 - All Not 0 then particular record</param>
        /// <returns></returns>
        [NonAction]
        public List<ContactModel> GetContactDetails(int contactId)
        {

            _contactModelList = new List<ContactModel>();
            try
            {
                //
                var _contact = addressBookEntities.Contacts.Where(x => x.StatusId == 1 && x.ContactId == (contactId == 0 ? x.ContactId : contactId)).OrderByDescending(x => x.CreatedOn).ToList();

                if (_contact != null && _contact.Count > 0)
                {
                    //
                    foreach (var item in _contact)
                    {
                        _contactModelList.Add(new ContactModel
                        {
                            ContactId = item.ContactId,
                            FirstName = item.FirstName,
                            LastName = item.LastName,
                            contactMobileList = item.ContactMobiles.Where(x => x.StatusId == (int)StatusHelper.Active && x.ContactId == (contactId == 0 ? x.ContactId : contactId)).Select(x => new ContactMobileModel { MobileNumber = x.MobileNumber }).ToList(),
                            contactEmailList = item.ContactEmails.Where(x => x.StatusId == (int)StatusHelper.Active && x.ContactId == (contactId == 0 ? x.ContactId : contactId)).Select(x => new ContactEmailModel { EmailAddress = x.EmailAddress }).ToList()
                        });
                    }
                }
                return _contactModelList;
            }
            catch (Exception)
            {
                return null;
            }
        }

        /// <summary>
        /// Validate Mobile Exists or Not
        /// </summary>
        /// <param name="contactId">Contact ID</param>
        /// <param name="mobileNumber">Mobile Number</param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult ValidateMobile(int contactId, string mobileNumber)
        {
            try
            {
                if (addressBookEntities.ContactMobiles.Any(x => x.MobileNumber == mobileNumber && x.ContactId != (contactId == 0 ? 0 : contactId) && x.StatusId == (int)StatusHelper.Active))
                {
                    return ResponseResult(null, MessageHelper.ContactMobileAlreadyExists, MessageCode.ERROR);
                }
                else
                    return ResponseResult(null, null, MessageCode.OK);
            }
            catch (Exception)
            {
                return ResponseResult(null, MessageHelper.ErrorMessage, MessageCode.ERROR);
            }
        }

        /// <summary>
        /// Validate Email Address
        /// </summary>
        /// <param name="contactId">Contact ID</param>
        /// <param name="emailAddress">Email Address</param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult ValidateEmailAddress(int contactId, string emailAddress)
        {
            try
            {
                if (addressBookEntities.ContactEmails.Any(x => x.EmailAddress == emailAddress && x.ContactId != (contactId == 0 ? 0 : contactId) && x.StatusId == (int)StatusHelper.Active))
                {
                    return ResponseResult(null, MessageHelper.ContactEmailAlreadyExists, MessageCode.ERROR);
                }
                else
                    return ResponseResult(null, null, MessageCode.OK);
            }
            catch (Exception)
            {
                return ResponseResult(null, MessageHelper.ErrorMessage, MessageCode.ERROR);
            }
        }
    }
}