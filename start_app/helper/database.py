# Code authors: Masum Hasan, Cengiz Ozel, Sammy Potter
# ROC-HCI Lab, University of Rochester
# Copyright (c) 2023 University of Rochester

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
# THE SOFTWARE.


from datetime import datetime
from sqlalchemy import or_

def init_db(db):
    class DB_Instances(db.Model):
        __bind_key__ = 'instances'
        entry_num = db.Column(db.Integer, primary_key=True, autoincrement=True)
        instance_id = db.Column(db.Integer, nullable=False)
        became_available = db.Column(db.DateTime, nullable=False)
        instance_join_time = db.Column(db.DateTime)
        instance_exit_time = db.Column(db.DateTime)
        meeting_id = db.Column(db.String(80))

        def __init__(self, instance_id):
            self.instance_id = instance_id
            self.became_available = datetime.now()
            self.instance_join_time = None
            self.instance_exit_time = None
            self.meeting_id = None
        
        @classmethod
        def add_new(cls, instance_id):
            db.session.add(cls(instance_id))
            db.session.commit()
        
        @classmethod
        def user_join(cls, instance_id, meeting_id):
            cls.query.filter_by(instance_id=instance_id, instance_join_time=None).update(dict(instance_join_time=datetime.now(), meeting_id=meeting_id))
            db.session.commit()

        @classmethod
        def user_left(cls, instance_id, meeting_id, app_context):
            with app_context:
                instance = cls.query.filter_by(meeting_id=meeting_id).first()

                if instance.instance_exit_time is None:
                    instance.instance_exit_time = datetime.now()
                    db.session.add(cls(instance_id))
                    db.session.commit()

        @classmethod
        def commit(cls):
            db.session.commit()

        # Every inmstance that was not occupied, update them to be occupied
        # TODO: delete the rows instead
        @classmethod
        def update_all_unoccupied(cls):
            cls.query.filter_by(instance_join_time=None).update(dict(instance_join_time=datetime.now(), instance_exit_time=datetime.now(), meeting_id="Restarting empty instance"))
            cls.query.filter_by(instance_exit_time=None).update(dict(instance_exit_time=datetime.now())) # removed meeting_id="Force closing instance"
            db.session.commit()
        
        # Return the numbers of instances that have a instance_join_time but not a instance_exit_time
        @classmethod
        def get_num_occupied(cls):
            occupied_instances = cls.query.filter(cls.instance_join_time.isnot(None), cls.instance_exit_time == None).all()
            return len(occupied_instances)

        @classmethod
        def get_instance(cls, meeting_id):
            first_row = cls.query.filter_by(instance_join_time=None).first()
            first_row.instance_join_time=datetime.now()
            first_row.meeting_id = meeting_id
            return first_row.instance_id
        
        @classmethod
        def is_instance_available(cls):
            return cls.query.filter_by(instance_join_time=None).first() != None
        
        @classmethod
        def get_approx_wait_time(cls, waitlist_index, max_time_seconds=10*60):
            num_unoccupied = cls.query.filter(cls.instance_join_time==None).count()
            waitlist_index = max(0, waitlist_index - num_unoccupied)

            occupied_instances = cls.query.filter(cls.instance_join_time.isnot(None), cls.instance_exit_time == None).order_by(cls.instance_join_time).all()
            wait_time = max_time_seconds - (datetime.now() - occupied_instances[waitlist_index % len(occupied_instances)].instance_join_time).seconds \
                        + max_time_seconds * ( (num_unoccupied + waitlist_index) // len(occupied_instances))

            print(f"CALCULATED WAIT TIME AS: {wait_time}")
            return wait_time

        @classmethod
        def get_elapsed_time(cls, meeting_id):
            instance_join_time = cls.query.filter_by(meeting_id=meeting_id).first()
            return (datetime.now() - instance_join_time.instance_join_time).seconds
            


    class Waitlist(db.Model):
        __bind_key__ = 'waitlist'
        entry_num = db.Column(db.Integer, primary_key=True, autoincrement=True)
        meeting_id = db.Column(db.String(80), nullable=False)
        is_premium = db.Column(db.Boolean, nullable=False)
        is_waiting = db.Column(db.Boolean, nullable=False, default=True)
        waitlist_join_time = db.Column(db.DateTime, nullable=False)
        waitlist_exit_time = db.Column(db.DateTime)

        def __init__(self, meeting_id, is_premium, waitlist_join_time):
            self.meeting_id = meeting_id
            self.is_premium = is_premium
            self.waitlist_join_time = waitlist_join_time


        @classmethod
        def add_new(cls, meeting_id, is_premium, waitlist_join_time):
            new_entry = cls(meeting_id=meeting_id, is_premium=is_premium, waitlist_join_time=waitlist_join_time)
            db.session.add(new_entry)
            db.session.commit()
        
        @classmethod
        def exit_waitlist(cls, meeting_id, waitlist_exit_time, app_context=None):
            if app_context:
                with app_context:
                    cls.query.filter_by(meeting_id=meeting_id).update(dict(waitlist_exit_time=waitlist_exit_time, is_waiting=False))
                    db.session.commit()
            else:
                cls.query.filter_by(meeting_id=meeting_id).update(dict(waitlist_exit_time=waitlist_exit_time, is_waiting=False))
                db.session.commit()

        ## user exited waitlist without getting connected
        @classmethod
        def set_inactive(cls, meeting_id):
            
            cls.query.filter(
                or_(cls.meeting_id == meeting_id, cls.waitlist_exit_time == None)
            ).update({ 'is_waiting': False, 'waitlist_exit_time': datetime.now()})

            db.session.commit()

        ## Get Sorted active user that are waitlist_exit_time=None, by is_premium, then by waitlist_join_time
        @classmethod
        def get_active_users(cls):
            return cls.query.filter_by(is_waiting=True, waitlist_exit_time=None).order_by(cls.is_premium.desc(), cls.waitlist_join_time).all()
        
        ## Get is a particular user is top of the sorted waitlist
        @classmethod
        def is_top_of_waitlist(cls, meeting_id):
            all_rows = cls.query.filter_by(is_waiting=True, waitlist_exit_time=None)
            print(f"all_rows: {all_rows.all()}")
            ordered_rows = all_rows.order_by(cls.is_premium.desc(), cls.waitlist_join_time)
            print(f"ordered_rows: {ordered_rows.all()}")
            first_row = ordered_rows.first()
            print(f"first_row: {first_row}")
            print(f"first_row.meeting_id: {first_row.meeting_id}")
            print(f"meeting_id: {meeting_id}")
            return cls.query.filter_by(is_waiting=True, waitlist_exit_time=None).order_by(cls.is_premium.desc(), cls.waitlist_join_time).first().meeting_id == meeting_id
        
        ## Set all active users to inactive
        @classmethod
        def set_all_inactive(cls):
            
            cls.query.filter(
                or_(cls.is_waiting == True, cls.waitlist_exit_time == None)
            ).update({ 'is_waiting': False, 'waitlist_exit_time': datetime.now()})

            db.session.commit()

        @classmethod
        def get_waitlist_position(cls, meeting_id):
            waiting = cls.query.filter_by(is_waiting=True, waitlist_exit_time=None).order_by(cls.is_premium.desc(), cls.waitlist_join_time).all()
            meeting_id_list = [item.meeting_id for item in waiting]
            index = meeting_id_list.index(meeting_id)
            return index

        # Commit
        @classmethod
        def commit(cls):
            db.session.commit()
    
    return DB_Instances, Waitlist