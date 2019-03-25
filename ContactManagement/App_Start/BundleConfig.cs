using System.Web;
using System.Web.Optimization;

namespace ContactManagement
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/custom.css"));
        }
    }
}
