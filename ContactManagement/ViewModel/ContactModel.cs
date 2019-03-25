using System.Collections.Generic;

namespace ContactManagement.ViewModel
{
    public class ContactModel
    {
        public int ContactId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }

        private List<ContactEmailModel> _contactEmailList = new List<ContactEmailModel>();
        private List<ContactMobileModel> _contactMobileList = new List<ContactMobileModel>();
        public List<ContactEmailModel> contactEmailList
        {
            get { return _contactEmailList; }
            set { _contactEmailList = value; }
        }

        public List<ContactMobileModel> contactMobileList
        {
            get { return _contactMobileList; }
            set { _contactMobileList = value; }
        }

    }
}