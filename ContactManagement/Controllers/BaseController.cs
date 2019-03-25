using ContactManagement.Helper;
using ContactManagement.Models;
using System;
using System.Web.Mvc;

namespace ContactManagement.Controllers
{
    public class BaseController : Controller
    {
        #region Declaration
        public AddressBookEntities addressBookEntities;
        #endregion

        /// <summary>
        /// Base Controller
        /// </summary>
        public BaseController()
        {
            addressBookEntities = new AddressBookEntities();
        }
        /// <summary>
        /// Response Result as JSON
        /// </summary>
        /// <param name="data"></param>
        /// <param name="message"></param>
        /// <param name="messageCode"></param>
        /// <returns></returns>
        public JsonResult ResponseResult(Object data, string message = MessageHelper.Success, MessageCode messageCode = MessageCode.OK)
        {
            return Json(new { data, message, messagecode = messageCode.ToString() }, JsonRequestBehavior.AllowGet);
        }

    }
}