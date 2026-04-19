import Capacitor
import UIKit

// CAPBridgeProtocol.viewController was removed in Capacitor 8.1.0 but
// @capacitor/camera still references it. Provide it as a computed property.
extension CAPBridgeProtocol {
    var viewController: UIViewController? {
        webView?.window?.rootViewController
    }
}
