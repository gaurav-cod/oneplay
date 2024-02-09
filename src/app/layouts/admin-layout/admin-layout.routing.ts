import { Routes } from '@angular/router';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { WishlistComponent } from 'src/app/pages/wishlist/wishlist.component';
import { PlayComponent } from 'src/app//pages/play/play.component';
import { FeedbackComponent } from 'src/app/pages/feedback/feedback.component';
import { WishlistGuard } from 'src/app/guards/wishlist.guard';
import { CheckoutComponent } from 'src/app/pages/checkout/checkout.component';
import { ChatComponent } from 'src/app/pages/chat/chat.component';
import { NotificationsComponent } from 'src/app/pages/notifications/notifications.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'settings/:tab',        component: UserProfileComponent },
    { path: 'chat',                 component: ChatComponent },
    { path: 'wishlist',             component: WishlistComponent, canDeactivate: [WishlistGuard] },
    { path: 'play',                 component: PlayComponent },
    { path: "quit",                 component: FeedbackComponent },
    { path: "checkout/:id",         component: CheckoutComponent },
    { path: "notifications",        component: NotificationsComponent },
];
