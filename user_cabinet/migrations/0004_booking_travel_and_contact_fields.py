from django.db import migrations, models
import django.core.validators


def populate_existing_bookings(apps, schema_editor):
    Booking = apps.get_model('user_cabinet', 'Booking')
    for booking in Booking.objects.select_related('tour').iterator():
        booking.travel_start_date = booking.tour.start_date
        booking.travel_end_date = booking.tour.end_date
        booking.contact_name = booking.user.username
        booking.contact_email = booking.user.email
        booking.contact_phone = '0000000'
        booking.save(update_fields=[
            'travel_start_date',
            'travel_end_date',
            'contact_name',
            'contact_email',
            'contact_phone',
        ])


class Migration(migrations.Migration):
    dependencies = [
        ('user_cabinet', '0003_remove_cartitem_cart_alter_cartitem_unique_together_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='travel_start_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='travel_end_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='adults',
            field=models.PositiveIntegerField(
                default=1,
                validators=[django.core.validators.MinValueValidator(1)],
            ),
        ),
        migrations.AddField(
            model_name='booking',
            name='children',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='booking',
            name='contact_name',
            field=models.CharField(default='', max_length=150),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='booking',
            name='contact_email',
            field=models.EmailField(default='', max_length=254),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='booking',
            name='contact_phone',
            field=models.CharField(default='', max_length=30),
            preserve_default=False,
        ),
        migrations.RunPython(populate_existing_bookings, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='booking',
            name='travel_start_date',
            field=models.DateField(),
        ),
        migrations.AlterField(
            model_name='booking',
            name='travel_end_date',
            field=models.DateField(),
        ),
    ]
